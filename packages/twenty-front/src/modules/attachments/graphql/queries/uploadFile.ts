import { gql } from '@apollo/client';

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!, $fileFolder: FileFolder) {
    uploadFile(file: $file, fileFolder: $fileFolder) {
      path
      token
    }
  }
`;
