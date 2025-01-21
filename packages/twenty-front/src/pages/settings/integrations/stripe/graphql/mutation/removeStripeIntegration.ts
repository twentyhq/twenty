import { gql } from '@apollo/client';

export const REMOVE_STRIPE_INTEGRATION = gql`
  mutation removeStripeIntegration($id: String!) {
    removeStripeIntegration(id: $id)
  }
`;
