import { gql } from '@apollo/client';

export const REMOVE_CHAT_CHANNEL_ROLE = gql`
  mutation RemoveChatChannelRole($channelId: UUID!, $roleId: UUID!) {
    removeChatChannelRole(channelId: $channelId, roleId: $roleId)
  }
`;
