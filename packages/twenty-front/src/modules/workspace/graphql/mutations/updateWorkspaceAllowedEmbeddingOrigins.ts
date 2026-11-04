import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_ALLOWED_EMBEDDING_ORIGINS = gql`
  mutation UpdateWorkspaceAllowedEmbeddingOrigins(
    $input: UpdateWorkspaceAllowedEmbeddingOriginsInput!
  ) {
    updateWorkspaceAllowedEmbeddingOrigins(data: $input) {
      id
      allowedEmbeddingOrigins
    }
  }
`;
