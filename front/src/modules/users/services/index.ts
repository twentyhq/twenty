import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($uuid: String) {
    users: findManyUser(where: { id: { equals: $uuid } }) {
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
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    findManyUser {
      id
      email
      displayName
    }
  }
`;
