import { gql } from '@apollo/client';

export const UPLOAD_WORKSPACE_LOGO = gql`
  mutation UploadWorkspaceLogo($file: Upload!) {
    uploadWorkspaceLogo(file: $file) {
      path
      token
    }
  }
`;
