import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const directionalControlsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const annual = await canvas.findByRole(
    'radio',
    { name: 'Annual' },
    { timeout: MOUNT_TIMEOUT },
  );
  await userEvent.click(annual);
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() =>
    expect(canvas.getByRole('radio', { name: 'Monthly' })).toBeChecked(),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
