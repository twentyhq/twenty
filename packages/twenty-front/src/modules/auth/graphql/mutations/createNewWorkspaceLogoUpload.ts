import { gql } from '@apollo/client';

export const CREATE_NEW_WORKSPACE_LOGO_UPLOAD = gql`
  mutation CreateNewWorkspaceLogoUpload(
    $workspaceId: String!
    $filename: String!
    $size: Float!
  ) {
    createNewWorkspaceLogoUpload(
      workspaceId: $workspaceId
      filename: $filename
      size: $size
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;
