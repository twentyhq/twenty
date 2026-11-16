import { gql } from '@apollo/client';

export const FIND_CHAT_MESSAGE_AGENT = gql`
  query FindChatMessageAgent($id: UUID!) {
    findOneAgent(input: { id: $id }) {
      id
      label
    }
  }
`;
