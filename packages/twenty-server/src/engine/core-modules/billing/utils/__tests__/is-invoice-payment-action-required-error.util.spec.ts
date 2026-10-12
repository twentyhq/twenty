/* @license Enterprise */

import Stripe from 'stripe';

import { isInvoicePaymentActionRequiredError } from 'src/engine/core-modules/billing/utils/is-invoice-payment-action-required-error.util';

const buildCardError = (code: string) =>
  new Stripe.errors.StripeCardError({
    type: 'card_error',
    code,
    message: 'Payment failed',
  });

describe('isInvoicePaymentActionRequiredError', () => {
  it.each([
    'invoice_payment_intent_requires_action',
    'authentication_required',
  ])('recognizes %s', (code) => {
    expect(isInvoicePaymentActionRequiredError(buildCardError(code))).toBe(
      true,
    );
  });

  it('treats a decline as a failure, not as an action to take', () => {
    expect(
      isInvoicePaymentActionRequiredError(buildCardError('card_declined')),
    ).toBe(false);
  });

  it('ignores errors that do not come from Stripe', () => {
    expect(
      isInvoicePaymentActionRequiredError(
        Object.assign(new Error('boom'), {
          code: 'invoice_payment_intent_requires_action',
        }),
      ),
    ).toBe(false);
  });
});
