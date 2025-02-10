import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $workspaceInviteHash: String
    $workspacePersonalInviteToken: String = null
    $captchaToken: String
    $workspaceId: String
    $locale: String
  ) {
    signUp(
      email: $email
      password: $password
      workspaceInviteHash: $workspaceInviteHash
      workspacePersonalInviteToken: $workspacePersonalInviteToken
      captchaToken: $captchaToken
      workspaceId: $workspaceId
      locale: $locale
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
