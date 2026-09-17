import { gql } from '@apollo/client';

import {
  AGENT_CHAT_CHANNEL_FRAGMENT,
  AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT,
} from '@/ai/graphql/fragments/agentChatChannelFragment';

export const GET_CHAT_CHANNELS = gql`
  ${AGENT_CHAT_CHANNEL_FRAGMENT}
  ${AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT}
  query GetChatChannels {
    chatChannels {
      ...AgentChatChannelFragment
    }
    chatChannelMembers {
      ...AgentChatChannelMemberFragment
    }
  }
`;
