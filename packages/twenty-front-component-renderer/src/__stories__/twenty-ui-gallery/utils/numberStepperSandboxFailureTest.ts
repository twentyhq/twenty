import { expect, userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

const MISSING_SELECTION_RANGE_ERROR =
  /^Uncaught TypeError: .+\.setSelectionRange is not a function$/;

export const numberStepperSandboxFailureTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const status = canvas.getByRole('status');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expectSandboxErrors({
      requiredErrors: [MISSING_SELECTION_RANGE_ERROR],
    });
    expect(status).toHaveTextContent('Value: 3; Changes: 0; Submissions: 0');
  };
