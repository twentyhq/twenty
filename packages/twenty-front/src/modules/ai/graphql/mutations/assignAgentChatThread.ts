import { gql } from '@apollo/client';

export const ASSIGN_INBOX_THREAD = gql`
  mutation AssignAgentChatThread(
    $threadId: UUID!
    $assigneeWorkspaceMemberId: UUID
  ) {
    assignAgentChatThread(
      threadId: $threadId
      assigneeWorkspaceMemberId: $assigneeWorkspaceMemberId
    )
  }
`;
