export const getTextBoundingClientRect = (element: HTMLElement) => {
  const range = document.createRange();

  range.selectNodeContents(element);

  return range.getBoundingClientRect();
};
