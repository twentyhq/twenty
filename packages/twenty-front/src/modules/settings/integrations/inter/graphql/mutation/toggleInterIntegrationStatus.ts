import { gql } from '@apollo/client';

export const TOGGLE_INTER_INTEGRATION_STATUS = gql`
  mutation ToggleInterIntegrationStatus($integrationId: String!) {
    toggleInterIntegrationStatus(integrationId: $integrationId)
  }
`;
