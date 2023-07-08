import { gql } from '@apollo/client';

export const GET_CURRENT_WORKSPACE = gql`
  query GetCurrentWorkspace {
    currentWorkspace {
      id
      workspaceMember {
        id
        user {
          id
          email
          avatarUrl
          firstName
          lastName
        }
      }
    }
  }
`;
