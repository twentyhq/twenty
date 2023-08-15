import { gql } from '@apollo/client';

export const REMOVE_WORKSPACE_LOGO = gql`
  mutation RemoveWorkspaceLogo {
    updateWorkspace(data: { logo: null }) {
      id
    }
  }
`;
