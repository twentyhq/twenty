import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
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
        locale
        colorScheme
      }
      supportUserHash
    }
  }
`;
