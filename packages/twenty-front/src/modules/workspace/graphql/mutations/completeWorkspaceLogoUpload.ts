import { gql } from '@apollo/client';

export const COMPLETE_WORKSPACE_LOGO_UPLOAD = gql`
  mutation CompleteWorkspaceLogoUpload($fileId: String!) {
    completeWorkspaceLogoUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
