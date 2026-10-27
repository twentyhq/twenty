import { gql } from '@apollo/client';

export const SIGN_UP_IN_NEW_WORKSPACE = gql`
  mutation SignUpInNewWorkspace(
    $input: SignUpInNewWorkspaceInput
    $captchaToken: String
  ) {
    signUpInNewWorkspace(input: $input, captchaToken: $captchaToken) {
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
