import { gql } from '@apollo/client';
export * from './update';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      displayName
      firstName
      lastName
      avatarUrl
      workspaceMember {
        id
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
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    findManyUser {
      id
      email
      displayName
      firstName
      lastName
    }
  }
`;
