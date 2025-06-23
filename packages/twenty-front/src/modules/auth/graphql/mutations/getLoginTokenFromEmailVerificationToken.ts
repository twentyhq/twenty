import { gql } from '@apollo/client';

export const GET_LOGIN_TOKEN_FROM_EMAIL_VERIFICATION_TOKEN = gql`
  mutation GetLoginTokenFromEmailVerificationToken(
    $emailVerificationToken: String!
    $email: String!
    $captchaToken: String
    $origin: String!
  ) {
    getLoginTokenFromEmailVerificationToken(
      emailVerificationToken: $emailVerificationToken
      email: $email
      captchaToken: $captchaToken
      origin: $origin
    ) {
      loginToken {
        ...AuthTokenFragment
      }
      workspaceUrls {
        ...WorkspaceUrlsFragment
      }
    }
  }
`;
