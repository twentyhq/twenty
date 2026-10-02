import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ROUND_TRIP_SETTLE_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const countrySelectSandboxTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  await expectFrontComponentMounted(canvas);
  const billing = canvas.getByRole('button', { name: 'Billing country' });
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
  expect(errorHandler).not.toHaveBeenCalled();

  await userEvent.click(disabled);
  await new Promise((resolve) =>
    setTimeout(resolve, SANDBOX_ROUND_TRIP_SETTLE_DELAY),
  );
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
  });
  expect(disabled).toHaveAttribute('aria-expanded', 'false');
  expect(
    canvas.getByRole('status', { name: 'Saved countries' }),
  ).toHaveTextContent('Billing: France; Shipping: Japan');
  errorHandler.mockClear();

  await userEvent.click(billing);
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
    allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.ELEMENT_DATASET],
  });
};
