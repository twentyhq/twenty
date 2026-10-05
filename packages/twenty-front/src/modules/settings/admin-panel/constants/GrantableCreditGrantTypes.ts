import { BillingCreditGrantType } from '~/generated-admin/graphql';

// Rollover and onboarding grants are written by jobs; the server enforces ADMIN_GRANTABLE_CREDIT_GRANT_TYPES too.
export const GRANTABLE_CREDIT_GRANT_TYPES: BillingCreditGrantType[] = [
  BillingCreditGrantType.COMPENSATION,
  BillingCreditGrantType.SALES,
];
