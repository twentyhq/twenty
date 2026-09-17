import { gql } from '@apollo/client';

import { AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT } from '@/ai/graphql/fragments/agentChatChannelFragment';

export const ADD_CHAT_CHANNEL_MEMBER = gql`
  ${AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT}
  mutation AddChatChannelMember($channelId: UUID!, $userWorkspaceId: UUID!) {
    addChatChannelMember(
      channelId: $channelId
      userWorkspaceId: $userWorkspaceId
    ) {
      ...AgentChatChannelMemberFragment
    }
  }
`;
