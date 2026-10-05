import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createDropdownOpenTest';

const BILLING_COUNTRY_TRIGGER_NAME = 'Billing country';

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
    await waitForSandboxRoundTrip();
    expect(disabled).toHaveAttribute('aria-expanded', 'false');
    expect(
      canvas.getByRole('status', { name: 'Saved countries' }),
    ).toHaveTextContent('Billing: France; Shipping: Japan');
    expect(errorHandler).not.toHaveBeenCalled();

    await billingCountrySelectOpenTest(context);
  };
};
