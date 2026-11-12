/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingArrangementType {
  COMMITTED_SEATS = 'COMMITTED_SEATS',
  FREE_SEATS = 'FREE_SEATS',
  DISCOUNT = 'DISCOUNT',
  TRIAL_EXTENSION = 'TRIAL_EXTENSION',
  WORKSPACE_CREDIT_ALLOWANCE = 'WORKSPACE_CREDIT_ALLOWANCE',
  LIMIT_OVERRIDE = 'LIMIT_OVERRIDE',
  REFUND = 'REFUND',
  CREDIT_GRANT = 'CREDIT_GRANT',
}

registerEnumType(BillingArrangementType, {
  name: 'BillingArrangementType',
  description: 'The kind of commercial exception a billing arrangement grants',
});

export const ONE_TIME_BILLING_ARRANGEMENT_TYPES: BillingArrangementType[] = [
  BillingArrangementType.REFUND,
  BillingArrangementType.CREDIT_GRANT,
];

// Their effect is computed from the row alone; the other types need a Stripe or usage limit write first
export const ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES: BillingArrangementType[] =
  [
    BillingArrangementType.COMMITTED_SEATS,
    BillingArrangementType.FREE_SEATS,
    BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
  ];
