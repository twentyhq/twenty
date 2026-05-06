import { gql } from '@apollo/client';

export const RENAME_CHAT_THREAD = gql`
  mutation RenameChatThread($id: UUID!, $title: String!) {
    renameChatThread(id: $id, title: $title) {
      id
      title
      updatedAt
    }
  }
`;
