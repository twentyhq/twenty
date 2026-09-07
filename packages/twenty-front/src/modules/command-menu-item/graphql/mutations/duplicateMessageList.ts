import { gql } from '@apollo/client';

export const DUPLICATE_MESSAGE_LIST = gql`
  mutation DuplicateMessageList($id: UUID!) {
    duplicateMessageList(id: $id) {
      id
      name
      description
      position
      memberCount
      createdAt
      updatedAt
    }
  }
`;
