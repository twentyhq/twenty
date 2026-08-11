/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingCreditGrantType {
  ROLLOVER = 'ROLLOVER',
  ONBOARDING_REWARD = 'ONBOARDING_REWARD',
  COMPENSATION = 'COMPENSATION',
  PARTNERSHIP = 'PARTNERSHIP',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

registerEnumType(BillingCreditGrantType, {
  name: 'BillingCreditGrantType',
  description: 'The origin of a batch of credits granted to a workspace',
});

// Only ROLLOVER credits are capped when they carry over to the next period.
// Credits we granted deliberately (compensation, partnership, onboarding
// rewards) keep their full value until spent or expired.
export const CAPPED_BILLING_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.ROLLOVER,
];

// What an operator may write by hand. ROLLOVER belongs to the period
// transition and ONBOARDING_REWARD to the onboarding jobs, so granting either
// by hand would change carry-forward behaviour and misclassify the audit
// trail.
export const ADMIN_GRANTABLE_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.COMPENSATION,
  BillingCreditGrantType.PARTNERSHIP,
  BillingCreditGrantType.MANUAL_ADJUSTMENT,
];
