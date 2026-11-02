import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_IFRAME_MEDIA_PERMISSIONS = gql`
  mutation UpdateWorkspaceIframeMediaPermissions(
    $input: UpdateWorkspaceIframeMediaPermissionsInput!
  ) {
    updateWorkspaceIframeMediaPermissions(data: $input) {
      id
      iframeMediaPermissions {
        origin
        microphone
        camera
      }
    }
  }
`;
