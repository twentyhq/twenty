import { gql } from '@apollo/client';

export const BILLING_EMAIL = gql`
  query BillingEmail {
    billingEmail {
      email
      belongsToWorkspaceMember
    }
  }
`;
