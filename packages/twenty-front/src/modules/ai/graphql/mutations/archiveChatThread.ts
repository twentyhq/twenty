import { gql } from '@apollo/client';

export const ARCHIVE_CHAT_THREAD = gql`
  mutation ArchiveChatThread($id: UUID!) {
    archiveChatThread(id: $id) {
      id
      deletedAt
      updatedAt
    }
  }
`;
