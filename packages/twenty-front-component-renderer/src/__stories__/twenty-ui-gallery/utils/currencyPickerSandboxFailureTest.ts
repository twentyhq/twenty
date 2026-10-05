import { expect, userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

const primaryCurrencyPickerOpenFailureTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Primary currency' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

export const currencyPickerSandboxFailureTest: TwentyUiGalleryPlayFunction =
  async (context) => {
    const canvas = within(context.canvasElement);
    const page = within(context.canvasElement.ownerDocument.body);
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

    await primaryCurrencyPickerOpenFailureTest(context);

    expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      page.queryByRole('dialog', { name: 'Disabled currencies' }),
    ).toBeNull();
  };
