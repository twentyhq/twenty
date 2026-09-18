import { gql } from '@apollo/client';

export const ASSIGN_CHAT_THREAD = gql`
  mutation AssignChatThread($id: UUID!, $assigneeUserWorkspaceId: UUID) {
    assignChatThread(
      id: $id
      assigneeUserWorkspaceId: $assigneeUserWorkspaceId
    ) {
      id
      assigneeUserWorkspaceId
      updatedAt
    }
  }
`;
