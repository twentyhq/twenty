import { expect } from 'storybook/test';

export const expectElementToReceivePointer = (
  element: Element,
  probedElement: Element = element,
): void => {
  const probedRectangle = probedElement.getBoundingClientRect();
  const elementAtProbedCenter = element.ownerDocument.elementFromPoint(
    probedRectangle.left + probedRectangle.width / 2,
    probedRectangle.top + probedRectangle.height / 2,
  );

  expect(element.contains(elementAtProbedCenter)).toBe(true);
};
