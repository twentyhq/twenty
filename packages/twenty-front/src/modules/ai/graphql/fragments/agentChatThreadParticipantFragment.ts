import { gql } from '@apollo/client';

export const AI_CHAT_THREAD_PARTICIPANT_FRAGMENT = gql`
  fragment AgentChatThreadParticipantFields on AgentChatThreadParticipant {
    id
    threadId
    lastReadAt
    archivedAt
    snoozedUntil
    isSubscribed
    lastMentionedAt
    mentionsResolvedAt
    updatedAt
  }
`;
