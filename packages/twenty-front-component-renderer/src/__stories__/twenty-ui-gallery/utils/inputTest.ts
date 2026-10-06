import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const inputTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);

  const segmentedControl = within(
    within(context.canvasElement).getByRole('radiogroup', { name: 'Choose' }),
  );
  const rightOption = segmentedControl.getByRole('radio', { name: 'Right' });

  await userEvent.click(rightOption);

  await waitFor(() => expect(rightOption).toBeChecked());
  expect(
    segmentedControl.getByRole('radio', { name: 'Left' }),
  ).not.toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();
};
