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
  await new Promise((resolve) => setTimeout(resolve, 1800));
  expect(toast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 0')).toBeVisible();
  await userEvent.tab();
  expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();
  await userEvent.unhover(toast);
  await new Promise((resolve) => setTimeout(resolve, 1800));
  expect(toast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 0')).toBeVisible();
  await userEvent.tab({ shift: true });
  await waitFor(() => expect(toast).not.toBeInTheDocument(), {
    timeout: 3000,
  });
  expect(canvas.getByText('Closed notifications: 1')).toBeVisible();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Show timed notification' }),
  );
  const updatedToast = await canvas.findByRole('status');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await userEvent.click(
    canvas.getByRole('button', { name: 'Update notification content' }),
  );
  await canvas.findByText('Changes saved: update 1');
  await new Promise((resolve) => setTimeout(resolve, 500));
  await userEvent.click(
    canvas.getByRole('button', { name: 'Update notification content' }),
  );
  await canvas.findByText('Changes saved: update 2');
  await waitFor(() => expect(updatedToast).not.toBeInTheDocument(), {
    timeout: 1100,
  });
  expect(canvas.getByText('Closed notifications: 2')).toBeVisible();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Show timed notification' }),
  );
  const persistentToast = await canvas.findByRole('status');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Keep notification open' }),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Update notification content' }),
  );
  await new Promise((resolve) => setTimeout(resolve, 1800));
  expect(persistentToast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 2')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(persistentToast).not.toBeInTheDocument());
  expect(canvas.getByText('Closed notifications: 3')).toBeVisible();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Show timed notification' }),
  );
  const progressToast = await canvas.findByRole('status');
  await userEvent.click(canvas.getByRole('button', { name: 'Track progress' }));
  await userEvent.click(
    canvas.getByRole('button', { name: 'Use short duration' }),
  );
  await new Promise((resolve) => setTimeout(resolve, 1800));
  expect(progressToast).toBeVisible();
  expect(canvas.getByText('Closed notifications: 3')).toBeVisible();
  await userEvent.click(
    canvas.getByRole('button', { name: 'Finish progress' }),
  );
  await waitFor(() => expect(progressToast).not.toBeInTheDocument(), {
    timeout: 1800,
  });
  expect(canvas.getByText('Closed notifications: 4')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
