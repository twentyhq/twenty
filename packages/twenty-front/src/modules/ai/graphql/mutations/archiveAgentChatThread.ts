import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const ARCHIVE_AGENT_CHAT_THREAD = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation ArchiveAgentChatThread($threadId: UUID!) {
    archiveAgentChatThread(threadId: $threadId) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
