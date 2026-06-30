import { gql } from '@apollo/client';

export const BILLING_PORTAL_SESSION = gql`
  query BillingPortalSession(
    $returnUrlPath: String
    $forPaymentMethodUpdate: Boolean
  ) {
    billingPortalSession(
      returnUrlPath: $returnUrlPath
      forPaymentMethodUpdate: $forPaymentMethodUpdate
    ) {
      url
    }
  }
`;
