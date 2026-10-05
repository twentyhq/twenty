import { gql } from '@apollo/client';

export const COMPLETE_ADMIN_APPLICATION_REGISTRATION_VARIABLE_FILE_UPLOAD = gql`
  mutation CompleteAdminApplicationRegistrationVariableFileUpload(
    $applicationRegistrationId: String!
    $fileId: UUID!
  ) {
    completeAdminApplicationRegistrationVariableFileUpload(
      applicationRegistrationId: $applicationRegistrationId
      fileId: $fileId
    ) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
