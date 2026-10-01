import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_ALLOWED_IFRAME_ORIGINS = gql`
  mutation UpdateWorkspaceAllowedIframeOrigins(
    $input: UpdateWorkspaceAllowedIframeOriginsInput!
  ) {
    updateWorkspaceAllowedIframeOrigins(data: $input) {
      id
      allowedIframeOrigins
    }
  }
`;
