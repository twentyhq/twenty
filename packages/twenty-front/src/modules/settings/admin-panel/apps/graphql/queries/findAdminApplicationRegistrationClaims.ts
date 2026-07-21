import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_CLAIMS = gql`
  query FindAdminApplicationRegistrationClaims(
    $applicationRegistrationId: String!
  ) {
    findAdminApplicationRegistrationClaims(
      applicationRegistrationId: $applicationRegistrationId
    ) {
      workspaceId
      workspaceDisplayName
    }
  }
`;
