import { gql } from '@apollo/client';

export const UPDATE_SERVICE_LEVEL = gql`
  mutation UpdateWhatsappIntegrationServiceLevel(
    $integrationId: String!
    $sla: Int!
  ) {
    updateWhatsappIntegrationServiceLevel(
      integrationId: $integrationId
      sla: $sla
    ) {
      name
      sla
    }
  }
`;
