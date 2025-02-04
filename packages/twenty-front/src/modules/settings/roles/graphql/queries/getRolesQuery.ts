import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  query GetRoles {
    getRoles {
      id
      label
      description
      canUpdateAllSettings
      isEditable
      workspaceMembers {
        ...WorkspaceMemberQueryFragment
      }
    }
  }
`;
