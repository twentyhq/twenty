import { APPLICATION_GRANT_FRAGMENT } from '@/settings/applications/grant/graphql/applicationGrantFragment';
import { FIELD_PERMISSION_FRAGMENT } from '@/settings/roles/graphql/fragments/fieldPermissionFragment';
import { gql } from '@apollo/client';

export const UPDATE_APPLICATION_GRANT_OBJECT_ACCESS = gql`
  ${APPLICATION_GRANT_FRAGMENT}
  mutation UpdateApplicationGrantObjectAccess(
    $input: UpdateApplicationGrantObjectAccessInput!
  ) {
    updateApplicationGrantObjectAccess(input: $input) {
      ...ApplicationGrantFragment
    }
  }
`;

export const APPROVE_APPLICATION_GRANT_PENDING_PERMISSIONS = gql`
  ${APPLICATION_GRANT_FRAGMENT}
  mutation ApproveApplicationGrantPendingPermissions($applicationId: UUID!) {
    approveApplicationGrantPendingPermissions(applicationId: $applicationId) {
      ...ApplicationGrantFragment
    }
  }
`;

export const UPSERT_APPLICATION_GRANT_FIELD_PERMISSIONS = gql`
  ${FIELD_PERMISSION_FRAGMENT}
  mutation UpsertApplicationGrantFieldPermissions(
    $applicationId: UUID!
    $upsertFieldPermissionsInput: UpsertFieldPermissionsInput!
  ) {
    upsertApplicationGrantFieldPermissions(
      applicationId: $applicationId
      upsertFieldPermissionsInput: $upsertFieldPermissionsInput
    ) {
      ...FieldPermissionFragment
    }
  }
`;

export const UPSERT_APPLICATION_GRANT_ROW_LEVEL_PERMISSION_PREDICATES = gql`
  mutation UpsertApplicationGrantRowLevelPermissionPredicates(
    $applicationId: UUID!
    $input: UpsertRowLevelPermissionPredicatesInput!
  ) {
    upsertApplicationGrantRowLevelPermissionPredicates(
      applicationId: $applicationId
      input: $input
    ) {
      predicates {
        id
      }
    }
  }
`;
