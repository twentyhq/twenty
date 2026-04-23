import { PERMISSION_FLAG_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagFragment';
import { gql } from '@apollo/client';

export const UPSERT_PERMISSION_FLAGS = gql`
  ${PERMISSION_FLAG_FRAGMENT}
  mutation UpsertPermissionFlags(
    $upsertPermissionFlagsInput: UpsertPermissionFlagsInput!
  ) {
    upsertPermissionFlags(
      upsertPermissionFlagsInput: $upsertPermissionFlagsInput
    ) {
      ...PermissionFlagFragment
    }
  }
`;
