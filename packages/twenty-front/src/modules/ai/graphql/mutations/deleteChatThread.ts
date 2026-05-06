import { gql } from '@apollo/client';

export const DELETE_CHAT_THREAD = gql`
  mutation DeleteChatThread($id: UUID!) {
    deleteChatThread(id: $id)
  }
`;
