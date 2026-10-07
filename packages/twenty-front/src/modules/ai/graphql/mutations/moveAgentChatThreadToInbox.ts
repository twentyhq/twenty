import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const MOVE_AGENT_CHAT_THREAD_TO_INBOX = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  mutation MoveAgentChatThreadToInbox($threadId: UUID!) {
    moveAgentChatThreadToInbox(threadId: $threadId) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
