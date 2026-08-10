import { BillingCreditGrantType } from '~/generated-admin/graphql';

// Rollover grants are written by the period transition, so granting one by hand
// would be overwritten at the next invoice.
export const GRANTABLE_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.COMPENSATION,
  BillingCreditGrantType.PARTNERSHIP,
  BillingCreditGrantType.MANUAL_ADJUSTMENT,
];
