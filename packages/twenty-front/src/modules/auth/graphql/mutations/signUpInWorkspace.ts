import { gql } from '@apollo/client';

export const SIGN_UP_IN_WORKSPACE = gql`
  mutation SignUpInWorkspace(
    $email: String!
    $password: String!
    $workspaceInviteHash: String
    $workspacePersonalInviteToken: String = null
    $captchaToken: String
    $workspaceId: String
    $locale: String
    $verifyEmailNextPath: String
  ) {
    signUpInWorkspace(
      email: $email
      password: $password
      workspaceInviteHash: $workspaceInviteHash
      workspacePersonalInviteToken: $workspacePersonalInviteToken
      captchaToken: $captchaToken
      workspaceId: $workspaceId
      locale: $locale
      verifyEmailNextPath: $verifyEmailNextPath
    ) {
      loginToken {
        ...AuthTokenFragment
      }
      workspace {
        id
        workspaceUrls {
          subdomainUrl
          customUrl
        }
      }
    }
  }
`;
