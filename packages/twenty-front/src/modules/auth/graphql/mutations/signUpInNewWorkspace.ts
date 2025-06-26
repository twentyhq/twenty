import { gql } from '@apollo/client';

export const SIGN_UP_IN_NEW_WORKSPACE = gql`
  mutation SignUpInNewWorkspace {
    signUpInNewWorkspace {
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
