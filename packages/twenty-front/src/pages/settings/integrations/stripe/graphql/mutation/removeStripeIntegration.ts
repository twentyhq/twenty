import { gql } from '@apollo/client';

export const REMOVE_STRIPE_INTEGRATION = gql`
  mutation removeStripeIntegration($accountId: String!) {
    removeStripeIntegration(accountId: $accountId)
  }
`;
