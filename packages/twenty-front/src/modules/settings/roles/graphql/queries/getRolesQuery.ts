import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { SETTING_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/settingPermissionFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${SETTING_PERMISSION_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  query GetRoles {
    getRoles {
      ...RoleFragment
      workspaceMembers {
        ...WorkspaceMemberQueryFragment
      }
      settingPermissions {
        ...SettingPermissionFragment
      }
      objectPermissions {
        ...ObjectPermissionFragment
      }
    }
  }
`;
