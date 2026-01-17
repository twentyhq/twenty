import { gql } from '@apollo/client';

export const CREATE_FILE = gql`
  mutation CreateFile($file: Upload!) {
    createFile(file: $file) {
      id
      path
      size
      createdAt
    }
  }
`;
