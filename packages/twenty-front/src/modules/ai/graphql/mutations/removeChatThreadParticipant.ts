import { gql } from '@apollo/client';

export const REMOVE_CHAT_THREAD_PARTICIPANT = gql`
  mutation RemoveChatThreadParticipant(
    $threadId: UUID!
    $userWorkspaceId: UUID!
  ) {
    removeChatThreadParticipant(
      threadId: $threadId
      userWorkspaceId: $userWorkspaceId
    )
  }
`;
