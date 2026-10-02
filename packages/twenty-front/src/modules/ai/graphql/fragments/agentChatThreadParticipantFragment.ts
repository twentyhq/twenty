import { gql } from '@apollo/client';

export const AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT = gql`
  fragment AgentChatThreadParticipantFields on AgentChatThreadParticipant {
    threadId
    lastReadAt
    archivedAt
    snoozedUntil
  }
`;
