import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const SNOOZE_AGENT_CHAT_THREAD = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation SnoozeAgentChatThread($threadId: UUID!, $snoozedUntil: DateTime!) {
    snoozeAgentChatThread(threadId: $threadId, snoozedUntil: $snoozedUntil) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
