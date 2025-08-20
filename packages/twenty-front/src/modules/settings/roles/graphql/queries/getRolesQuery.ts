import { FIELD_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/fieldPermissionFragment';
import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { WORKSPACE_MEMBER_QUERY_FRAGMENT } from '@/workspace-member/graphql/fragments/workspaceMemberQueryFragment';
import { gql } from '@apollo/client';

export const GET_ROLES = gql`
  ${WORKSPACE_MEMBER_QUERY_FRAGMENT}
  ${ROLE_FRAGMENT}
  ${PERMISSION_FLAG_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  ${FIELD_PERMISSION_FRAGMENT}
  query GetRoles {
    getRoles {
      ...RoleFragment
      workspaceMembers {
        ...WorkspaceMemberQueryFragment
      }
      permissionFlags {
        ...PermissionFlagFragment
      }
      objectPermissions {
        ...ObjectPermissionFragment
      }
      fieldPermissions {
        ...FieldPermissionFragment
      }
    }
  }
`;
