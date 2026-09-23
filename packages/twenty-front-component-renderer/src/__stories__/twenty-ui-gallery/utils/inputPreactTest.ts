import { expect, userEvent, within } from 'storybook/test';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createGalleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryRenderTest';

export const inputPreactTest: TwentyUiGalleryPlayFunction = async (context) => {
  await createGalleryRenderTest({ expectedFailedComponents: ['Radio'] })(
    context,
  );

  const choices = within(
    within(context.canvasElement).getByRole('radiogroup', { name: 'Choose' }),
  );
  expect(choices.getByRole('radio', { name: 'Left' })).toBeChecked();
  await userEvent.click(choices.getByRole('radio', { name: 'Right' }));
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
    allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION],
  });
  expect(choices.getByRole('radio', { name: 'Left' })).toBeChecked();
};
