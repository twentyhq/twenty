import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_LOGO = gql`
  mutation UploadWorkspaceLogo($file: Upload!) {
    uploadWorkspaceLogo(file: $file)
  }
`;
