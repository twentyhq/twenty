import { gql } from '@apollo/client';

export const UPLOAD_FILES_FIELD_FILE = gql`
  mutation UploadFilesFieldFile($file: Upload!) {
    uploadFilesFieldFile(file: $file) {
      id
      path
      size
      createdAt
    }
  }
`;
