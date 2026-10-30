import { expect } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

export const expectElementBackdropToReachHostPage = (element: Element) => {
  expect(getComputedStyle(element).backdropFilter).not.toBe('none');

  for (
    let ancestor = element.parentElement;
    isDefined(ancestor);
    ancestor = ancestor.parentElement
  ) {
    expect(getComputedStyle(ancestor).clipPath).toBe('none');
  }
};
