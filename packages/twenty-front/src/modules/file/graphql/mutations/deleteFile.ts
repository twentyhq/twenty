import { gql } from '@apollo/client';

export const DELETE_FILE = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
      name
      fullPath
      size
      type
      createdAt
    }
  }
`;
