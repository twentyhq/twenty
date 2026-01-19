import { gql } from '@apollo/client';

export const DELETE_FILE = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
      path
      size
      createdAt
    }
  }
`;
