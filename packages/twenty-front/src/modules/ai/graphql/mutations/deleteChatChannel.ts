import { gql } from '@apollo/client';

export const DELETE_CHAT_CHANNEL = gql`
  mutation DeleteChatChannel($id: UUID!) {
    deleteChatChannel(id: $id)
  }
`;
