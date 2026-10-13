export const readScrollportRectangle = (scrollContainer: Element) => {
  const borderBoxRectangle = scrollContainer.getBoundingClientRect();
  const top = borderBoxRectangle.top + scrollContainer.clientTop;
  const left = borderBoxRectangle.left + scrollContainer.clientLeft;

  return {
    top,
    right: left + scrollContainer.clientWidth,
    bottom: top + scrollContainer.clientHeight,
    left,
  };
};
