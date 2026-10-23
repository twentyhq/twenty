import { expect, waitFor } from 'storybook/test';

export const focusWithoutScrolling = async (element: HTMLElement) => {
  element.focus({ preventScroll: true });

  await waitFor(() => expect(element).toHaveFocus());
};
