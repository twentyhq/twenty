import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ROUND_TRIP_SETTLE_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

const BILLING_COUNTRY_TRIGGER_NAME = 'Billing country';

const billingCountrySelectOpenTest = createOverlayOpenTest({
  trigger: { role: 'button', name: BILLING_COUNTRY_TRIGGER_NAME },
  expectedOpenStatus: null,
  popupText: 'Brésil',
});

export const countrySelectTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  const canvas = within(context.canvasElement);

  await expectFrontComponentMounted(canvas);
  const billing = canvas.getByRole('button', {
    name: BILLING_COUNTRY_TRIGGER_NAME,
  });
  const shipping = canvas.getByRole('button', { name: 'Shipping country' });
  const disabled = canvas.getByRole('button', { name: 'Disabled country' });

  expect(billing).toHaveTextContent('France');
  expect(shipping).toHaveTextContent('Japon');
  expect(within(billing).getByText('🇫🇷')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(within(shipping).getByText('🇯🇵')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(disabled).toHaveAttribute('aria-disabled', 'true');
  expect(disabled).not.toBeDisabled();
  expect(disabled).toHaveTextContent('France');

  await userEvent.click(disabled);
  await new Promise((resolve) =>
    setTimeout(resolve, SANDBOX_ROUND_TRIP_SETTLE_DELAY),
  );
  expect(disabled).toHaveAttribute('aria-expanded', 'false');
  expect(
    canvas.getByRole('status', { name: 'Saved countries' }),
  ).toHaveTextContent('Billing: France; Shipping: Japan');
  expect(errorHandler).not.toHaveBeenCalled();

  await billingCountrySelectOpenTest(context);
};
