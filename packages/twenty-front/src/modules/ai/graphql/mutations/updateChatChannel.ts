import { gql } from '@apollo/client';

import { AGENT_CHAT_CHANNEL_FRAGMENT } from '@/ai/graphql/fragments/agentChatChannelFragment';

export const UPDATE_CHAT_CHANNEL = gql`
  ${AGENT_CHAT_CHANNEL_FRAGMENT}
  mutation UpdateChatChannel($id: UUID!, $input: UpdateAgentChatChannelInput!) {
    updateChatChannel(id: $id, input: $input) {
      ...AgentChatChannelFragment
    }
  }
`;
