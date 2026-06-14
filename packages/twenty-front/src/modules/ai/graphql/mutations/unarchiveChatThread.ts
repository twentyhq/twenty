import { gql } from '@apollo/client';

export const UNARCHIVE_CHAT_THREAD = gql`
  mutation UnarchiveChatThread($id: UUID!) {
    unarchiveChatThread(id: $id) {
      id
      deletedAt
      updatedAt
    }
  }
`;
