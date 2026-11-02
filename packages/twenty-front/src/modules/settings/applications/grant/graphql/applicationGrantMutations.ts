import { APPLICATION_GRANT_FRAGMENT } from '@/settings/applications/grant/graphql/applicationGrantFragment';
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
