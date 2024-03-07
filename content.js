document.addEventListener("DOMContentLoaded", function () {
  const captureButton = document.getElementById("capture");
  const screenshotContainer = document.getElementById("screenshotContainer");
  const downloadButton = document.getElementById("download");

  screenshotContainer.addEventListener("click", handleScreenshotContainerClick);
  captureButton.addEventListener("click", captureVisibleTab);
  downloadButton.addEventListener("click", downloadScreenshots);

  loadFromLocalStorage();

  function handleScreenshotContainerClick(event) {
    if (event.target.tagName === "BUTTON") {
      const clickedButton = event.target;
      const parentContainer = clickedButton.parentNode;

      if (screenshotContainer.children.length === 1) {
        hideDownloadBtn();
        showTitle();
      }

      parentContainer.remove();
      updateLocalStorage();
    }
  }

  function loadFromLocalStorage() {
    const storedScreenshots = localStorage.getItem("screenshots");
    if (storedScreenshots) {
      screenshotContainer.innerHTML = storedScreenshots;
      makeItemsDraggable();
      showDownloadBtn();
    } else {
      showTitle();
    }
  }

  function makeItemsDraggable() {
    const draggableItems = screenshotContainer.querySelectorAll("div");
    draggableItems.forEach((item) => {
      setDraggableAttributes(item);

      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragend", handleDragEnd);
      item.addEventListener("dragover", handleDragOver);
      item.addEventListener("drop", handleDrop);
      item.addEventListener("dragenter", handleDragEnter);
    });
  }

  function setDraggableAttributes(item) {
    item.draggable = true;
  }

  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", "screenshot");
    this.style.transform = "scale(1.1)";
  }

  function handleDragEnd(e) {
    this.style.transform = "scale(1)";
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.getData("text/plain") === "screenshot") {
      const container = screenshotContainer;
      const draggedElement = document.querySelector("[data-dragged=true]");

      if (draggedElement) container.insertBefore(this, draggedElement);
      else container.appendChild(this);

      this.removeAttribute("data-dragged");
      makeItemsDraggable();
      updateLocalStorage();
    }
  }

  function handleDragEnter() {
    this.setAttribute("data-dragged", "true");
  }

  function captureVisibleTab() {
    chrome.tabs.captureVisibleTab(
      { format: "png", quality: 100 },
      function (screenshotDataUrl) {
        const screenshotDiv = createScreenshotDiv(screenshotDataUrl);
        screenshotContainer.appendChild(screenshotDiv);
        hideTitle();
        makeItemsDraggable();
        updateLocalStorage();
        showDownloadBtn();
      }
    );
  }

  function createScreenshotDiv(screenshotDataUrl) {
    const screenshotDiv = document.createElement("div");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    const screenshotImage = new Image();
    screenshotImage.src = screenshotDataUrl;

    screenshotDiv.appendChild(screenshotImage);
    screenshotDiv.appendChild(deleteBtn);
    setDraggableAttributes(screenshotDiv);

    return screenshotDiv;
  }

  function downloadScreenshots() {
    const screenshots = document.querySelector("#screenshotContainer");
    const captureDiv = document.querySelector("#downloadImages");
    const pdfPageHeight = 4.5;
    showLoader();
    Array.from(screenshots.children).forEach((el) => {
      const clonedDiv = el.cloneNode(true);
      const imgContainer = document.createElement("div");
      imgContainer.style.height = `${pdfPageHeight}in`;

      const img = clonedDiv.querySelector("img");
      img.style.width = "100%";

      imgContainer.appendChild(img);
      captureDiv.appendChild(imgContainer);
    });

    var opt = {
      margin: 0,
      filename: `tabShot.pdf`,
      image: { type: "png", quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: {
        unit: "in",
        format: [pdfPageHeight, 10],
        orientation: "landscape",
      },
    };
    html2pdf().set(opt).from(captureDiv).save();
    new Promise((resolve) => {
      html2pdf()
        .set(opt)
        .from(captureDiv)
        .outputPdf()
        .then(() => {
          captureDiv.parentNode.removeChild(captureDiv);
          hideLoader();
          resolve();
        });
    });
  }

  function updateLocalStorage() {
    const updatedContent = screenshotContainer.innerHTML;
    localStorage.setItem("screenshots", updatedContent);
  }
  function showTitle() {
    document.querySelector(".title").style.display = "block";
  }
  function hideTitle() {
    document.querySelector(".title").style.display = "none";
  }
  function showDownloadBtn() {
    document.querySelector(".download").style.display = "block";
  }
  function hideDownloadBtn() {
    document.querySelector(".download").style.display = "none";
  }
  function hideLoader() {
    document.querySelector(".loader").style.display = "none";
  }
  function showLoader() {
    document.querySelector(".loader").style.display = "flex";
  }
});
