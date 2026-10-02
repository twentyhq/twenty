import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const MARK_AGENT_CHAT_THREAD_AS_READ = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation MarkAgentChatThreadAsRead($threadId: UUID!) {
    markAgentChatThreadAsRead(threadId: $threadId) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
