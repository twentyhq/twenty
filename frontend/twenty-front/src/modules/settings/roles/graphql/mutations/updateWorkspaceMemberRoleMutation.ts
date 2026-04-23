import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MEMBER_ROLE = gql`
  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${ROLE_FRAGMENT}
  mutation UpdateWorkspaceMemberRole(
    $workspaceMemberId: UUID!
    $roleId: UUID!
  ) {
    updateWorkspaceMemberRole(
      workspaceMemberId: $workspaceMemberId
      roleId: $roleId
    ) {
      ...WorkspaceMemberQueryFragment
      roles {
        ...RoleFragment
      }
    }
  }
`;
