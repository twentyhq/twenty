import { gql } from '@apollo/client';

export const CHALLENGE = gql`
  mutation Challenge(
    $email: String!
    $password: String!
    $captchaToken: String
  ) {
    challenge(email: $email, password: $password, captchaToken: $captchaToken) {
      loginToken {
        ...AuthTokenFragment
      }
    }
  }
`;
