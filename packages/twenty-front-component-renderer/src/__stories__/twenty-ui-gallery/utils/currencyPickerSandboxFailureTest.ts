import { expect, userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const currencyPickerSandboxFailureTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);

    const primaryTrigger = canvas.getByRole('button', {
      name: 'Primary currency',
    });
    const secondaryTrigger = canvas.getByRole('button', {
      name: 'Secondary currency',
    });
    const disabledTrigger = canvas.getByRole('button', {
      name: 'Disabled currency',
    });

    expect(primaryTrigger).toHaveTextContent('EUR');
    expect(secondaryTrigger).toHaveTextContent('USD');
    expect(disabledTrigger).toBeDisabled();
    await userEvent.click(disabledTrigger);
    expect(page.queryByRole('dialog')).toBeNull();
    await userEvent.click(primaryTrigger);

    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
    });
  };
