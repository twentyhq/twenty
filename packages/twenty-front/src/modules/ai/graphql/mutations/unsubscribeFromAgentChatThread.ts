import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const UNSUBSCRIBE_FROM_AGENT_CHAT_THREAD = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation UnsubscribeFromAgentChatThread($threadId: UUID!) {
    unsubscribeFromAgentChatThread(threadId: $threadId) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
