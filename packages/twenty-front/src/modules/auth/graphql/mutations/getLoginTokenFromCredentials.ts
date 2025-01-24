import { gql } from '@apollo/client';

export const GET_LOGIN_TOKEN_FROM_CREDENTIALS = gql`
  mutation GetLoginTokenFromCredentials(
    $email: String!
    $password: String!
    $captchaToken: String
  ) {
    getLoginTokenFromCredentials(
      email: $email
      password: $password
      captchaToken: $captchaToken
    ) {
      loginToken {
        ...AuthTokenFragment
      }
    }
  }
`;
