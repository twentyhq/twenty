import { gql } from '@apollo/client';

export const GET_CHAT_THREAD = gql`
  query GetChatThread($id: UUID!) {
    chatThread(id: $id) {
      id
      title
    }
  }
`;
