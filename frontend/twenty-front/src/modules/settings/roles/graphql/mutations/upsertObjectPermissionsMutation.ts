import { OBJECT_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/objectPermissionFragment';
import { gql } from '@apollo/client';

export const UPSERT_OBJECT_PERMISSIONS = gql`
  ${OBJECT_PERMISSION_FRAGMENT}
  mutation UpsertObjectPermissions(
    $upsertObjectPermissionsInput: UpsertObjectPermissionsInput!
  ) {
    upsertObjectPermissions(
      upsertObjectPermissionsInput: $upsertObjectPermissionsInput
    ) {
      ...ObjectPermissionFragment
    }
  }
`;
