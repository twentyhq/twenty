import { gql } from '@apollo/client';

import { AGENT_CHAT_CHANNEL_FRAGMENT } from '@/ai/graphql/fragments/agentChatChannelFragment';

export const CREATE_CHAT_CHANNEL = gql`
  ${AGENT_CHAT_CHANNEL_FRAGMENT}
  mutation CreateChatChannel($input: CreateAgentChatChannelInput!) {
    createChatChannel(input: $input) {
      ...AgentChatChannelFragment
    }
  }
`;
