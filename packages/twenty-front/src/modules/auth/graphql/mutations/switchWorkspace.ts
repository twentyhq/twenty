import { gql } from '@apollo/client';

export const SWITCH_WORKSPACE = gql`
  mutation SwitchWorkspace($workspaceId: String!) {
    switchWorkspace(workspaceId: $workspaceId) {
      id
      authProviders {
        sso {
          id
          name
          type
          status
          issuer
        }
        google
        magicLink
        password
        microsoft
      }
    }
  }
`;
