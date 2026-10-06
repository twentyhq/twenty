import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { isCreditTopUpRefusedBeforeCharge } from '@/settings/billing/utils/isCreditTopUpRefusedBeforeCharge';

const buildBillingError = (subCode: string) =>
  new CombinedGraphQLErrors({
    errors: [
      { message: 'Refused', extensions: { code: 'FORBIDDEN', subCode } },
    ],
    data: null,
  });

describe('isCreditTopUpRefusedBeforeCharge', () => {
  it.each([
    'BILLING_CREDIT_AMOUNT_INVALID',
    'BILLING_CREDIT_TOP_UP_NOT_ALLOWED',
    'BILLING_PRICE_NOT_FOUND',
    'BILLING_INVOICE_PAYMENT_FAILED',
  ])('should treat %s as a refusal that charged nothing', (subCode) => {
    expect(isCreditTopUpRefusedBeforeCharge(buildBillingError(subCode))).toBe(
      true,
    );
  });

  it('should not assume a Stripe error left the card uncharged', () => {
    expect(
      isCreditTopUpRefusedBeforeCharge(
        buildBillingError('BILLING_STRIPE_ERROR'),
      ),
    ).toBe(false);
  });

  it('should not assume a network error left the card uncharged', () => {
    expect(isCreditTopUpRefusedBeforeCharge(new Error('Failed to fetch'))).toBe(
      false,
    );
  });
});
