import { expect } from 'storybook/test';

import { readScrollportRectangle } from '@/__stories__/shared/test-utils/readScrollportRectangle';

const SCROLLPORT_TOLERANCE = 1;

export const expectElementWithinScrollport = ({
  element,
  scrollContainer,
}: {
  element: Element;
  scrollContainer: Element;
}): void => {
  const elementRectangle = element.getBoundingClientRect();
  const scrollport = readScrollportRectangle(scrollContainer);

  expect(elementRectangle.top).toBeGreaterThanOrEqual(
    scrollport.top - SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.bottom).toBeLessThanOrEqual(
    scrollport.bottom + SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.left).toBeGreaterThanOrEqual(
    scrollport.left - SCROLLPORT_TOLERANCE,
  );
  expect(elementRectangle.right).toBeLessThanOrEqual(
    scrollport.right + SCROLLPORT_TOLERANCE,
  );
};
