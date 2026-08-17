export const getScrollBottomInPx = (scrollWrapperElement: HTMLElement) =>
  scrollWrapperElement.scrollHeight -
  scrollWrapperElement.clientHeight -
  scrollWrapperElement.scrollTop;
