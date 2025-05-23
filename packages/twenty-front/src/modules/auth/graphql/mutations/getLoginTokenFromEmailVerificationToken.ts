import { gql } from '@apollo/client';

export const GET_LOGIN_TOKEN_FROM_EMAIL_VERIFICATION_TOKEN = gql`
  mutation GetLoginTokenFromEmailVerificationToken(
    $emailVerificationToken: String!
    $captchaToken: String
    $origin: String!
  ) {
    getLoginTokenFromEmailVerificationToken(
      emailVerificationToken: $emailVerificationToken
      captchaToken: $captchaToken
      origin: $origin
    ) {
      loginToken {
        ...AuthTokenFragment
      }
      workspaceUrls {
        subdomainUrl
        customUrl
      }
    }
  }
`;
