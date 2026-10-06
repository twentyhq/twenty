/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

// No "manual" type: whether a human wrote the grant is grantedByUserId
export enum BillingCreditGrantType {
  ROLLOVER = 'ROLLOVER',
  ONBOARDING_REWARD = 'ONBOARDING_REWARD',
  COMPENSATION = 'COMPENSATION',
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
}

registerEnumType(BillingCreditGrantType, {
  name: 'BillingCreditGrantType',
  description: 'The origin of a batch of credits granted to a workspace',
});

export const CAPPED_BILLING_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.ROLLOVER,
];

// Spent after free credits, like Stripe's paid category, so customers keep what they bought longest
export const PAID_BILLING_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.PURCHASE,
];

// ROLLOVER and ONBOARDING_REWARD belong to their jobs and PURCHASE to a paid Stripe invoice: by hand they would change carry-forward and the audit trail
export const ADMIN_GRANTABLE_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.COMPENSATION,
  BillingCreditGrantType.SALES,
];
