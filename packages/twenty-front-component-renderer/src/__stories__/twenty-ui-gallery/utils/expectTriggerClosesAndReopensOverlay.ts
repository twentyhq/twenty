import { expect, userEvent, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';

export const expectTriggerClosesAndReopensOverlay = async (
  trigger: HTMLElement,
) => {
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );

  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

  expect(errorHandler).not.toHaveBeenCalled();
};
