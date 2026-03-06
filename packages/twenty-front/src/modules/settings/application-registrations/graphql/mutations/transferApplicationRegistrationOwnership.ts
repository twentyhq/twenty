import { gql } from '@apollo/client';

export const TRANSFER_APPLICATION_REGISTRATION_OWNERSHIP = gql`
  mutation TransferApplicationRegistrationOwnership(
    $applicationRegistrationId: String!
    $targetWorkspaceSubdomain: String!
  ) {
    transferApplicationRegistrationOwnership(
      applicationRegistrationId: $applicationRegistrationId
      targetWorkspaceSubdomain: $targetWorkspaceSubdomain
    ) {
      id
      name
    }
  }
`;
