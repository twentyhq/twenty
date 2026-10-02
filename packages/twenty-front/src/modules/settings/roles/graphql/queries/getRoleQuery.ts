import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { ROLE_PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/rolePermissionFlagFragment';
import { ROLE_FRAGMENT } from '@/settings/roles/graphql/fragments/roleFragment';
import { gql } from '@apollo/client';

export const GET_ROLE = gql`
  ${ROLE_FRAGMENT}
  ${ROLE_PERMISSION_FLAG_FRAGMENT}
  ${OBJECT_PERMISSION_FRAGMENT}
  query GetRole($id: UUID!) {
    getRole(id: $id) {
      ...RoleFragment
      permissionFlags {
        ...RolePermissionFlagFragment
      }
      objectPermissions {
        ...ObjectPermissionFragment
      }
    }
  }
`;
