import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const settingsRowTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const notifications = canvas.getByRole('switch', { name: 'Notifications' });
  await expect(notifications).toHaveAccessibleDescription('Updates by email');
  await userEvent.click(canvas.getByText('Disabled notifications'));
  await userEvent.click(
    canvas.getByRole('switch', { name: 'Disabled notifications' }),
  );
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: disabled; Changes: 0',
  );

  await userEvent.click(canvas.getByText('Notifications'));

  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: enabled; Changes: 1',
    ),
  );
  expect(notifications).toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();
};
