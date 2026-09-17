import { gql } from '@apollo/client';

export const GET_CHAT_CHANNEL_ASSIGNABLE_ROLES = gql`
  query GetChatChannelAssignableRoles {
    chatChannelAssignableRoles {
      id
      label
      icon
    }
  }
`;
