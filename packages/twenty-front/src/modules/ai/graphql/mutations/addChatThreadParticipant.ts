import { gql } from '@apollo/client';

export const ADD_CHAT_THREAD_PARTICIPANT = gql`
  mutation AddChatThreadParticipant($threadId: UUID!, $userWorkspaceId: UUID!) {
    addChatThreadParticipant(
      threadId: $threadId
      userWorkspaceId: $userWorkspaceId
    ) {
      id
      threadId
      userWorkspaceId
      role
      createdAt
    }
  }
`;
