import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const REFUSED_BEFORE_CHARGE_ERROR_CODES = [
  'BILLING_CREDIT_AMOUNT_INVALID',
  'BILLING_CREDIT_TOP_UP_NOT_ALLOWED',
  'BILLING_PRICE_NOT_FOUND',
  'BILLING_INVOICE_PAYMENT_FAILED',
];

// Any other error may come after Stripe charged the card, so a retry must reuse the idempotency key
export const isCreditTopUpRefusedBeforeCharge = (error: unknown): boolean =>
  REFUSED_BEFORE_CHARGE_ERROR_CODES.some((errorCode) =>
    isGraphqlErrorOfType(error, errorCode),
  );
