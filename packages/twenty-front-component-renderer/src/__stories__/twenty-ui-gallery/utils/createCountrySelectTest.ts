import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

type Canvas = ReturnType<typeof within>;

const BILLING_COUNTRY_TRIGGER_NAME = 'Billing country';

const expectTriggersShowSavedCountriesWithDecorativeFlags = (
  canvas: Canvas,
) => {
  const billingTrigger = canvas.getByRole('button', {
    name: BILLING_COUNTRY_TRIGGER_NAME,
  });
  const shippingTrigger = canvas.getByRole('button', {
    name: 'Shipping country',
  });

  expect(billingTrigger).toHaveTextContent('France');
  expect(shippingTrigger).toHaveTextContent('Japon');
  expect(within(billingTrigger).getByText('🇫🇷')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  expect(within(shippingTrigger).getByText('🇯🇵')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
};

const expectDisabledTriggerIgnoresClick = async (canvas: Canvas) => {
  const disabledTrigger = canvas.getByRole('button', {
    name: 'Disabled country',
  });

  expect(disabledTrigger).toHaveAttribute('aria-disabled', 'true');
  expect(disabledTrigger).not.toBeDisabled();
  expect(disabledTrigger).toHaveTextContent('France');

  await userEvent.click(disabledTrigger);
  await waitForSandboxRoundTrip();
  expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
  expect(
    canvas.getByRole('status', { name: 'Saved countries' }),
  ).toHaveTextContent('Billing: France; Shipping: Japan');
};

export const createCountrySelectTest = (
  runtime: 'react' | 'preact',
): TwentyUiGalleryPlayFunction => {
  const billingCountrySelectOpenTest = createDropdownOpenTest({
    runtime,
    triggerName: BILLING_COUNTRY_TRIGGER_NAME,
    popupText: 'Brésil',
  });

  return async (context) => {
    const canvas = within(context.canvasElement);
    await expectFrontComponentMounted(canvas);

    expectTriggersShowSavedCountriesWithDecorativeFlags(canvas);
    await expectDisabledTriggerIgnoresClick(canvas);
    expect(errorHandler).not.toHaveBeenCalled();
    await billingCountrySelectOpenTest(context);
  };
};
