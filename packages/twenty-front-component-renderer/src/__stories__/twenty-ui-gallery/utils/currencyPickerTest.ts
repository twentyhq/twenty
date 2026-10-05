import { expect, userEvent, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

const PRIMARY_CURRENCY_TRIGGER_NAME = 'Primary currency';

const primaryCurrencyPickerOpenTest = createOverlayOpenTest({
  trigger: { role: 'button', name: PRIMARY_CURRENCY_TRIGGER_NAME },
  popupText: 'Canadian Dollar',
});

export const currencyPickerTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  const canvas = within(context.canvasElement);
  const page = within(context.canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const primaryTrigger = canvas.getByRole('button', {
    name: PRIMARY_CURRENCY_TRIGGER_NAME,
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

  await primaryCurrencyPickerOpenTest(context);

  expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
  expect(
    page.queryByRole('dialog', { name: 'Disabled currencies' }),
  ).toBeNull();
};
