import { gql } from '@apollo/client';

export const UPLOAD_FILE_TO_BUCKET = gql`
  mutation UploadFileToBucket(
    $file: Upload!
    $type: String!
    $workspaceId: String!
    $isInternal: Boolean
  ) {
    uploadFileToBucket(
      file: $file
      type: $type
      workspaceId: $workspaceId
      isInternal: $isInternal
    )
  }
`;
