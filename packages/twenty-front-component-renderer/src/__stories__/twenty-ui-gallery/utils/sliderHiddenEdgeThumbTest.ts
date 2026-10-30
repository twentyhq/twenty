import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectAssertionToKeepFailing } from '@/__stories__/twenty-ui-gallery/utils/expectAssertionToKeepFailing';
import { expectSliderGalleryMounted } from '@/__stories__/twenty-ui-gallery/utils/expectSliderGalleryMounted';
import { expect } from 'storybook/test';

export const sliderHiddenEdgeThumbTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const slider = await expectSliderGalleryMounted(canvasElement);

  await expectAssertionToKeepFailing(() => expect(slider).toBeVisible());
  expect(errorHandler).not.toHaveBeenCalled();
};
