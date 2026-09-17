import { gql } from '@apollo/client';

export const GET_CHAT_THREAD_PARTICIPANTS = gql`
  query GetChatThreadParticipants($threadId: UUID!) {
    chatThreadParticipants(threadId: $threadId) {
      id
      threadId
      userWorkspaceId
      role
      createdAt
    }
  }
`;
