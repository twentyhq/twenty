import { FIELD_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/fieldPermissionFragment';
import { gql } from '@apollo/client';

export const UPSERT_FIELD_PERMISSIONS = gql`
  ${FIELD_PERMISSION_FRAGMENT}
  mutation UpsertFieldPermissions(
    $upsertFieldPermissionsInput: UpsertFieldPermissionsInput!
  ) {
    upsertFieldPermissions(
      upsertFieldPermissionsInput: $upsertFieldPermissionsInput
    ) {
      ...FieldPermissionFragment
    }
  }
`;
