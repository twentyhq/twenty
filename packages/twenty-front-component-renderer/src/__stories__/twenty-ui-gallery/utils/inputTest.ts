import { expect, userEvent, within } from 'storybook/test';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const inputTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);

  const canvas = within(context.canvasElement);

  await userEvent.click(
    within(canvas.getByRole('radiogroup', { name: 'Choose' })).getByRole(
      'radio',
      { name: 'Right' },
    ),
  );
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
    allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  });
  expect(canvas.getByRole('radiogroup', { name: 'Choose' })).toBeVisible();
};
