import { gql } from '@apollo/client';

export const GET_ALL_STRIPE_INTEGRATIONS = gql`
  query GetAllStripeIntegrations($workspaceId: String!) {
    getAllStripeIntegrations(workspaceId: $workspaceId) {
      accountId
      workspace {
        id
      }
    }
  }
`;
