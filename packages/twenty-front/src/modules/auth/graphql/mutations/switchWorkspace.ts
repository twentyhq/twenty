import { gql } from '@apollo/client';

export const SWITCH_WORKSPACE = gql`
  mutation SwitchWorkspace($workspaceId: String!) {
    switchWorkspace(workspaceId: $workspaceId) {
      id
      subdomain
      authProviders {
        sso
        google
        magicLink
        password
        microsoft
      }
    }
  }
`;
