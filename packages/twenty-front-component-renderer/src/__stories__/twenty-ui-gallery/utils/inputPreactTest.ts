import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { SEGMENTED_CONTROL_ORDERING_ERROR } from '@/__stories__/twenty-ui-gallery/constants/SEGMENTED_CONTROL_ORDERING_ERROR';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createGalleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryRenderTest';

export const inputPreactTest: TwentyUiGalleryPlayFunction = async (context) => {
  await createGalleryRenderTest({ expectedFailedComponents: ['RadioGroup'] })(
    context,
  );

  const canvas = within(context.canvasElement);

  await userEvent.click(
    within(canvas.getByRole('radiogroup', { name: 'Choose' })).getByRole(
      'radio',
      { name: 'Right' },
    ),
  );
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  });
  await waitFor(() => {
    const status = canvas.getByTestId('gallery-status');

    expect(status).toHaveAttribute(
      'data-failed-names',
      'RadioGroup, SegmentedControl',
    );
    expect(status).toHaveAttribute(
      'data-failed-messages',
      expect.stringMatching(SEGMENTED_CONTROL_ORDERING_ERROR),
    );
  });
  await expect(
    canvas.queryByRole('radiogroup', { name: 'Choose' }),
  ).not.toBeInTheDocument();
};
