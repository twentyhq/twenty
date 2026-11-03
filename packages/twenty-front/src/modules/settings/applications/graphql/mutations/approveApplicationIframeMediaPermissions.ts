import { gql } from '@apollo/client';

export const APPROVE_APPLICATION_IFRAME_MEDIA_PERMISSIONS = gql`
  mutation ApproveApplicationIframeMediaPermissions(
    $applicationId: UUID!
    $approvedIframeMediaPermissions: [IframeMediaPermissionInput!]!
  ) {
    approveApplicationIframeMediaPermissions(
      applicationId: $applicationId
      approvedIframeMediaPermissions: $approvedIframeMediaPermissions
    ) {
      id
      grantedIframeMediaPermissions {
        origin
        microphone
        camera
      }
    }
  }
`;
