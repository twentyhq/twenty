import { gql } from '@apollo/client';

export const UPLOAD_WORKSPACE_LOGO_LEGACY = gql`
  mutation UploadWorkspaceLogoLegacy($file: Upload!) {
    uploadWorkspaceLogoLegacy(file: $file) {
      path
      token
    }
  }
`;
