import { expect } from 'storybook/test';

export const expectElementToReceivePointer = (element: Element): void => {
  const elementRectangle = element.getBoundingClientRect();
  const elementAtCenter = element.ownerDocument.elementFromPoint(
    elementRectangle.left + elementRectangle.width / 2,
    elementRectangle.top + elementRectangle.height / 2,
  );

  expect(element.contains(elementAtCenter)).toBe(true);
};
