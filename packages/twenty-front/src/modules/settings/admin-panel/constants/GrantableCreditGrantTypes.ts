import { BillingCreditGrantType } from '~/generated-admin/graphql';

// Rollover grants are written by the period transition and onboarding rewards
// by the onboarding jobs, so neither can be written by hand. The server
// enforces this too, in ADMIN_GRANTABLE_CREDIT_GRANT_TYPES.
export const GRANTABLE_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.COMPENSATION,
  BillingCreditGrantType.SALES,
];
