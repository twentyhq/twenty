import { gql } from '@apollo/client';

export const CREATE_CHAT_THREAD = gql`
  mutation CreateChatThread {
    createChatThread {
      id
      title
      createdAt
      updatedAt
    }
  }
`;
