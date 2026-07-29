import { gql } from '@apollo/client';

export const BILLING_HAS_PAYMENT_METHOD = gql`
  query BillingHasPaymentMethod {
    billingHasPaymentMethod
  }
`;
