import { isDefined } from '~/utils/isDefined';

export const isFirstOverflowingChildElement = ({
  containerElement,
  childElement,
}: {
  containerElement: HTMLElement | null;
  childElement: HTMLElement | null;
}) =>
  isDefined(containerElement) &&
  isDefined(childElement) &&
  // First element is always displayed.
  isDefined(childElement.previousElementSibling) &&
  containerElement.scrollWidth > containerElement.clientWidth &&
  childElement.offsetLeft > containerElement.clientWidth &&
  (childElement.previousElementSibling as HTMLElement).offsetLeft <
    containerElement.clientWidth;
