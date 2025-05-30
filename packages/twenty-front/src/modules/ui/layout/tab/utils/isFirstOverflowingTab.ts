import { isDefined } from 'twenty-shared/utils';

export const isFirstOverflowingTab = ({
  containerElement,
  tabElement,
}: {
  containerElement: HTMLElement | null;
  tabElement: HTMLElement | null;
}) =>
  isDefined(containerElement) &&
  isDefined(tabElement) &&
  // First tab is always displayed
  isDefined(tabElement.previousElementSibling) &&
  containerElement.scrollWidth > containerElement.clientWidth &&
  tabElement.offsetLeft + tabElement.offsetWidth >
    containerElement.clientWidth &&
  (tabElement.previousElementSibling as HTMLElement).offsetLeft <
    containerElement.clientWidth;
