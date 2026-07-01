import { isDefined } from 'twenty-shared/utils';
export const isFirstOverflowingChildElement = ({
  containerElement,
  childElement,
}: {
  containerElement: HTMLElement | null;
  childElement: HTMLElement | null;
}) => {
  if (!isDefined(containerElement) || !isDefined(childElement)) {
    return false;
  }

  // First element is always displayed.
  if (!isDefined(childElement.previousElementSibling)) {
    return false;
  }

  const previousChildElement = childElement.previousElementSibling as HTMLElement;

  const isContainerOverflowing =
    containerElement.scrollWidth > containerElement.clientWidth;

  const isChildElementOverflowing =
    childElement.offsetLeft + childElement.offsetWidth >
    containerElement.clientWidth;

  const isPreviousChildElementVisible =
    previousChildElement.offsetLeft + previousChildElement.offsetWidth <=
    containerElement.clientWidth;

  return (
    isContainerOverflowing &&
    isChildElementOverflowing &&
    isPreviousChildElementVisible
  );
};
