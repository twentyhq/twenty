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

export const VERIFY = gql`
  mutation Verify($loginToken: String!) {
    verify(loginToken: $loginToken) {
      user {
        id
        email
        displayName
        workspaceMember {
          id
          workspace {
            id
            domainName
            displayName
            logo
          }
        }
      }
      tokens {
        accessToken {
          token
          expiresAt
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;

export const RENEW_TOKEN = gql`
  mutation RenewToken($refreshToken: String!) {
    renewToken(refreshToken: $refreshToken) {
      tokens {
        accessToken {
          expiresAt
          token
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;
