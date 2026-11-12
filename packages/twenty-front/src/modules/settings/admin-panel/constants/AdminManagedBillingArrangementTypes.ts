import { BillingArrangementType } from '~/generated-admin/graphql';

// Mirrors ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES on the server, which rejects the others
export const ADMIN_MANAGED_BILLING_ARRANGEMENT_TYPES: BillingArrangementType[] =
  [
    BillingArrangementType.FREE_SEATS,
    BillingArrangementType.COMMITTED_SEATS,
    BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
  ];
