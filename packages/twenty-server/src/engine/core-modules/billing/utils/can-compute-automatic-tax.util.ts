/* @license Enterprise */

import type Stripe from 'stripe';

// Without a usable customer location Stripe refuses to finalize an invoice that has automatic tax on
const COMPUTABLE_AUTOMATIC_TAX_STATUSES: Stripe.Customer.Tax.AutomaticTax[] = [
  'supported',
  'not_collecting',
];

export const canComputeAutomaticTax = (
  automaticTaxStatus: Stripe.Customer.Tax.AutomaticTax | null,
): boolean =>
  automaticTaxStatus !== null &&
  COMPUTABLE_AUTOMATIC_TAX_STATUSES.includes(automaticTaxStatus);
