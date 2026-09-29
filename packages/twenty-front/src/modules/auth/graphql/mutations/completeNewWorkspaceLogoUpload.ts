import { gql } from '@apollo/client';

export const COMPLETE_NEW_WORKSPACE_LOGO_UPLOAD = gql`
  mutation CompleteNewWorkspaceLogoUpload(
    $workspaceId: String!
    $fileId: String!
  ) {
    completeNewWorkspaceLogoUpload(workspaceId: $workspaceId, fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;
