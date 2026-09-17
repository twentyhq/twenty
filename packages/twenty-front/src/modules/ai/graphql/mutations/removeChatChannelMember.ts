import { gql } from '@apollo/client';

export const REMOVE_CHAT_CHANNEL_MEMBER = gql`
  mutation RemoveChatChannelMember($channelId: UUID!, $userWorkspaceId: UUID!) {
    removeChatChannelMember(
      channelId: $channelId
      userWorkspaceId: $userWorkspaceId
    )
  }
`;
