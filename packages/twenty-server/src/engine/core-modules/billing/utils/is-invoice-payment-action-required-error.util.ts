/* @license Enterprise */

import Stripe from 'stripe';

const PAYMENT_ACTION_REQUIRED_ERROR_CODES = [
  'invoice_payment_intent_requires_action',
  'authentication_required',
];

export const isInvoicePaymentActionRequiredError = (error: unknown): boolean =>
  error instanceof Stripe.errors.StripeError &&
  PAYMENT_ACTION_REQUIRED_ERROR_CODES.includes(error.code ?? '');
