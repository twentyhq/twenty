import { gql } from '@apollo/client';

export const UPLOAD_IMAGE = gql`
  mutation uploadImage($file: Upload!, $fileFolder: FileFolder) {
    uploadImage(file: $file, fileFolder: $fileFolder) {
      path
      token
    }
  }
`;
