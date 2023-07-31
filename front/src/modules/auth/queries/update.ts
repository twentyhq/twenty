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

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $workspaceInviteHash: String
  ) {
    signUp(
      email: $email
      password: $password
      workspaceInviteHash: $workspaceInviteHash
    ) {
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
        firstName
        lastName
        canImpersonate
        workspaceMember {
          id
          allowImpersonation
          workspace {
            id
            domainName
            displayName
            logo
            inviteHash
          }
        }
        settings {
          id
          colorScheme
          locale
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

// TODO: Fragments should be used instead of duplicating the user fields !
export const IMPERSONATE = gql`
  mutation Impersonate($userId: String!) {
    impersonate(userId: $userId) {
      user {
        id
        email
        displayName
        firstName
        lastName
        canImpersonate
        workspaceMember {
          id
          allowImpersonation
          workspace {
            id
            domainName
            displayName
            logo
            inviteHash
          }
        }
        settings {
          id
          colorScheme
          locale
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
