import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const popoverTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account details' });
  expect(trigger).toHaveAttribute('data-native-trigger', 'account');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Details: open; reason: trigger-press; target: account',
  );
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Details: closed; reason: trigger-press; target: account',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
