import { gql } from '@apollo/client';

import { AGENT_CHAT_CHANNEL_ROLE_FRAGMENT } from '@/ai/graphql/fragments/agentChatChannelFragment';

export const ADD_CHAT_CHANNEL_ROLE = gql`
  ${AGENT_CHAT_CHANNEL_ROLE_FRAGMENT}
  mutation AddChatChannelRole($channelId: UUID!, $roleId: UUID!) {
    addChatChannelRole(channelId: $channelId, roleId: $roleId) {
      ...AgentChatChannelRoleFragment
    }
  }
`;
