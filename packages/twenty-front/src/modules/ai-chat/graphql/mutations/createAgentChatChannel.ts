import { gql } from '@apollo/client';

export const CREATE_INBOX_CHANNEL = gql`
  mutation CreateAgentChatChannel($input: CreateAgentChatChannelInput!) {
    createAgentChatChannel(input: $input) {
      id
    }
  }
`;
