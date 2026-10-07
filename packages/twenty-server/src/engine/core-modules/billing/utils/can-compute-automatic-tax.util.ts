/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

const COMPUTABLE_AUTOMATIC_TAX_STATUSES: Stripe.Customer.Tax.AutomaticTax[] = [
  'supported',
  'not_collecting',
];

export const canComputeAutomaticTax = (
  automaticTaxStatus: Stripe.Customer.Tax.AutomaticTax | null,
): boolean =>
  isDefined(automaticTaxStatus) &&
  COMPUTABLE_AUTOMATIC_TAX_STATUSES.includes(automaticTaxStatus);
