import { gql } from '@apollo/client';

export const CREATE_FILE_UPLOAD = gql`
  mutation CreateFileUpload(
    $filename: String!
    $size: Float!
    $fileFolder: FileFolder!
    $fieldMetadataId: String
  ) {
    createFileUpload(
      filename: $filename
      size: $size
      fileFolder: $fileFolder
      fieldMetadataId: $fieldMetadataId
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;
