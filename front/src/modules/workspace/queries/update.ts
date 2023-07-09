import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($data: WorkspaceUpdateInput!) {
    updateWorkspace(data: $data) {
      id
      domainName
      displayName
      logo
    }
  }
`;

export const UPDATE_WORKSPACE_LOGO = gql`
  mutation UploadWorkspaceLogo($file: Upload!) {
    uploadWorkspaceLogo(file: $file)
  }
`;

export const REMOVE_WORKSPACE_LOGO = gql`
  mutation RemoveWorkspaceLogo {
    updateWorkspace(data: { logo: { set: null } }) {
      id
    }
  }
`;
