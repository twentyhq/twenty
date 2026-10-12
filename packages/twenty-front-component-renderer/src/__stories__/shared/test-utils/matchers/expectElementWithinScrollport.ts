import { expect } from 'storybook/test';

const SCROLLPORT_TOLERANCE = 1;

export const expectElementWithinScrollport = ({
  element,
  scrollContainer,
}: {
  element: Element;
  scrollContainer: Element;
}): void => {
  const elementRectangle = element.getBoundingClientRect();
  const scrollContainerRectangle = scrollContainer.getBoundingClientRect();
  const scrollportTop =
    scrollContainerRectangle.top + scrollContainer.clientTop;
  const scrollportLeft =
    scrollContainerRectangle.left + scrollContainer.clientLeft;

  expect(elementRectangle.top).toBeGreaterThanOrEqual(
    scrollportTop - SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.bottom).toBeLessThanOrEqual(
    scrollportTop + scrollContainer.clientHeight + SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.left).toBeGreaterThanOrEqual(
    scrollportLeft - SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.right).toBeLessThanOrEqual(
    scrollportLeft + scrollContainer.clientWidth + SCROLLPORT_TOLERANCE,
  );
};
