import { gql } from '@apollo/client';

export const CREATE_AGENT_CHAT_CHANNEL = gql`
  mutation CreateAgentChatChannel($input: CreateAgentChatChannelInput!) {
    createAgentChatChannel(input: $input) {
      id
    }
  }
`;
