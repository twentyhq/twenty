import { gql } from '@apollo/client';

export const GET_INBOX_CHANNELS = gql`
  query GetAgentChatChannels {
    agentChatChannels {
      id
      name
      icon
      color
      position
      roleIds
      applicationId
      isAccessible
    }
  }
`;
