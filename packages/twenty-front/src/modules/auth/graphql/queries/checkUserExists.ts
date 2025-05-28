import { gql } from '@apollo/client';
import { WORKSPACE_URLS_FRAGMENT } from '@/users/graphql/fragments/workspaceUrlsFragment';

export const CHECK_USER_EXISTS = gql`
  query CheckUserExists($email: String!, $captchaToken: String) {
    checkUserExists(email: $email, captchaToken: $captchaToken) {
      __typename
      ... on UserExists {
        exists
        availableWorkspaces {
          id
          displayName
          workspaceUrls {
            ...WorkspaceUrlsFragment
          }
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
  ${WORKSPACE_URLS_FRAGMENT}
`;
