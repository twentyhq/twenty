import { gql } from '@apollo/client';

export const SIGN_UP_IN_NEW_WORKSPACE = gql`
  mutation SignUpInNewWorkspace($input: SignUpInNewWorkspaceInput) {
    signUpInNewWorkspace(input: $input) {
      loginToken {
        ...AuthTokenFragment
      }
      workspace {
        id
        workspaceUrls {
          ...WorkspaceUrlsFragment
        }
      }
    }
  }
`;
