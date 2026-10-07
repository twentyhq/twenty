import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const SUBSCRIBE_TO_AGENT_CHAT_THREAD = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation SubscribeToAgentChatThread($threadId: UUID!) {
    subscribeToAgentChatThread(threadId: $threadId) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
