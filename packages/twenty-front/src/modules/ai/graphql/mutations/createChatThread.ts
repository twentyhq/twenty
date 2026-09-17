import { gql } from '@apollo/client';

export const CREATE_CHAT_THREAD = gql`
  mutation CreateChatThread($channelId: UUID) {
    createChatThread(channelId: $channelId) {
      id
      title
      channelId
      ownerUserWorkspaceId
      createdAt
      updatedAt
    }
  }
`;
