import { gql } from '@apollo/client';

export const COMPLETE_APPLICATION_REGISTRATION_VARIABLE_FILE_UPLOAD = gql`
  mutation CompleteApplicationRegistrationVariableFileUpload(
    $applicationRegistrationId: String!
    $fileId: UUID!
  ) {
    completeApplicationRegistrationVariableFileUpload(
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
