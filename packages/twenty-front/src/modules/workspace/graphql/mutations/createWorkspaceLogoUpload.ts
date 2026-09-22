import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_LOGO_UPLOAD = gql`
  mutation CreateWorkspaceLogoUpload($filename: String!, $size: Float!) {
    createWorkspaceLogoUpload(filename: $filename, size: $size) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;
