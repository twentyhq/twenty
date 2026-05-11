import { PERMISSION_FLAG_GRANT_FRAGMENT } from '@/settings/roles/graphql/fragments/permissionFlagGrantFragment';
import { gql } from '@apollo/client';

export const UPSERT_PERMISSION_FLAG_GRANTS = gql`
  ${PERMISSION_FLAG_GRANT_FRAGMENT}
  mutation UpsertPermissionFlagGrants(
    $upsertPermissionFlagGrantsInput: UpsertPermissionFlagGrantsInput!
  ) {
    upsertPermissionFlagGrants(
      upsertPermissionFlagGrantsInput: $upsertPermissionFlagGrantsInput
    ) {
      ...PermissionFlagGrantFragment
    }
  }
`;
