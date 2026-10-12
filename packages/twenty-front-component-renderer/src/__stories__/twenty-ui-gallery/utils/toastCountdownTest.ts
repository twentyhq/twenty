import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const toastCountdownTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show timed notification' }),
  );
  const toast = await canvas.findByRole('status');

  await userEvent.hover(toast);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(toast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 0')).toBeVisible();
  await userEvent.tab();
  expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();
  await userEvent.unhover(toast);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  expect(toast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 0')).toBeVisible();
  await userEvent.tab({ shift: true });
  await waitFor(() => expect(toast).not.toBeInTheDocument(), {
    timeout: 3000,
  });
  expect(canvas.getByText('Closed notifications: 1')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
