import { gql } from '@apollo/client';

export const GET_WORKSPACE_IFRAME_ORIGINS = gql`
  query GetWorkspaceIframeOrigins {
    currentWorkspace {
      id
      allowedIframeOrigins
    }
  }
`;
