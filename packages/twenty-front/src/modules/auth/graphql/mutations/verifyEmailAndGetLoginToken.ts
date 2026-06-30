import { gql } from '@apollo/client';

export const GET_LOGIN_TOKEN_FROM_EMAIL_VERIFICATION_TOKEN = gql`
  mutation VerifyEmailAndGetLoginToken(
    $emailVerificationToken: String!
    $email: String!
    $captchaToken: String
    $origin: String!
  ) {
    verifyEmailAndGetLoginToken(
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
