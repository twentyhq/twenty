import { gql } from '@apollo/client';

import { AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT } from '@/ai/graphql/fragments/agentChatChannelFragment';

export const JOIN_CHAT_CHANNEL = gql`
  ${AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT}
  mutation JoinChatChannel($id: UUID!) {
    joinChatChannel(id: $id) {
      ...AgentChatChannelMemberFragment
    }
  }
`;
