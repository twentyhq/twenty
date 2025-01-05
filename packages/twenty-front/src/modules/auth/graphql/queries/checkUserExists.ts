import { gql } from '@apollo/client';

export const CHECK_USER_EXISTS = gql`
  query CheckUserExists($email: String!, $captchaToken: String) {
    checkUserExists(email: $email, captchaToken: $captchaToken) {
      __typename
      ... on UserExists {
        exists
        availableWorkspaces {
          id
          displayName
          subdomain
          logo
          sso {
            type
            id
            issuer
            name
            status
          }
        }
        isEmailVerified
      }
      ... on UserNotExists {
        exists
      }
    }
  }
`;
