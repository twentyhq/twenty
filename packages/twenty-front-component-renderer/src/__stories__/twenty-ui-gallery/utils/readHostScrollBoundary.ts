export const readHostScrollBoundary = (canvasElement: HTMLElement) => {
  const widgetScrollFrame = canvasElement.querySelector(
    '[aria-label="Widget scroll frame"]',
  );

  return {
    widgetScrollTop: widgetScrollFrame?.scrollTop ?? 0,
    windowScrollY: canvasElement.ownerDocument.defaultView?.scrollY ?? 0,
  };
};
