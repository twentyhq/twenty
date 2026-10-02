import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

const MISSING_EVENT_TYPE =
  "Uncaught TypeError: Cannot read properties of undefined (reading 'type')";

export const countrySelectSandboxTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);

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
  expect(disabled).toBeDisabled();
  await userEvent.click(disabled);
  expect(body.queryByRole('dialog')).toBeNull();
  expect(errorHandler).not.toHaveBeenCalled();
  expect(
    canvas.getByRole('status', { name: 'Saved countries' }),
  ).toHaveTextContent('Billing: France; Shipping: Japan');
  await userEvent.click(billing);
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
    allowedAdditionalErrors: [MISSING_EVENT_TYPE],
  });
};
