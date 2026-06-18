import { gql } from '@apollo/client';

export const UPLOAD_NEW_WORKSPACE_LOGO = gql`
  mutation UploadNewWorkspaceLogo($workspaceId: String!, $file: Upload!) {
    uploadNewWorkspaceLogo(workspaceId: $workspaceId, file: $file) {
      url
    }
  }
`;
