import { ROLE_PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/rolePermissionFlagFragment';
import { gql } from '@apollo/client';

export const UPSERT_PERMISSION_FLAGS = gql`
  ${ROLE_PERMISSION_FLAG_FRAGMENT}
  mutation UpsertPermissionFlags(
    $upsertPermissionFlagsInput: UpsertPermissionFlagsInput!
  ) {
    upsertPermissionFlags(
      upsertPermissionFlagsInput: $upsertPermissionFlagsInput
    ) {
      ...RolePermissionFlagFragment
    }
  }
`;
