import { gql } from '@apollo/client';

export const CREATE_FILE = gql`
  mutation CreateFile(
    $name: String!
    $fullPath: String!
    $size: Float!
    $type: String!
  ) {
    createFile(name: $name, fullPath: $fullPath, size: $size, type: $type) {
      id
      name
      fullPath
      size
      type
      createdAt
    }
  }
`;
