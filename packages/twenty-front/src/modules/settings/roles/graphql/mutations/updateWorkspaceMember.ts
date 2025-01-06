import { gql } from '@apollo/client';

export const TOGGLE_MEMBER_STATUS = gql`
  mutation ToggleMemberStatus($userId: ID!, $workspaceId: ID!) {
    toggleMemberStatus(userId: $userId, workspaceId: $workspaceId) {
      id
      status
    }
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateMemberRole($roleId: ID!, $userId: ID!, $workspaceId: ID!) {
    updateMemberRole(
      roleId: $roleId
      userId: $userId
      workspaceId: $workspaceId
    ) {
      id
      roleId
    }
  }
`;
