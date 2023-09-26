import { gql } from '@apollo/client';

export const UPLOAD_ATTACHMENT = gql`
  mutation UploadAttachment(
    $file: Upload!
    $activityId: String!
    $companyId: String!
    $personId: String!
  ) {
    uploadAttachment(
      file: $file
      activityId: $activityId
      companyId: $companyId
      personId: $personId
    )
  }
`;
