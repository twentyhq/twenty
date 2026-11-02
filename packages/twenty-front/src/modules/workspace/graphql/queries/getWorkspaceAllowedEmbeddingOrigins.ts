import { gql } from '@apollo/client';

export const GET_WORKSPACE_ALLOWED_EMBEDDING_ORIGINS = gql`
  query GetWorkspaceAllowedEmbeddingOrigins {
    currentWorkspace {
      id
      allowedEmbeddingOrigins
    }
  }
`;
