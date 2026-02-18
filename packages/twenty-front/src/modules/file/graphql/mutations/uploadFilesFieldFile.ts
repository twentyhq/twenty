import { gql } from '@apollo/client';

export const UPLOAD_FILES_FIELD_FILE = gql`
  mutation UploadFilesFieldFile($file: Upload!, $fieldMetadataId: String!) {
    uploadFilesFieldFile(file: $file, fieldMetadataId: $fieldMetadataId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
