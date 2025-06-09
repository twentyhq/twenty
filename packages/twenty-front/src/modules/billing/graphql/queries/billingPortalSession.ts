import { gql } from '@apollo/client';

export const BILLING_PORTAL_SESSION = gql`
  query BillingPortalSession($returnUrlPath: String) {
    billingPortalSession(returnUrlPath: $returnUrlPath) {
      url
    }
  }
`;
