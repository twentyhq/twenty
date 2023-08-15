import { gql } from '@apollo/client';

export const CHALLENGE = gql`
  mutation Challenge($email: String!, $password: String!) {
    challenge(email: $email, password: $password) {
      loginToken {
        expiresAt
        token
      }
    }
  }
`;
