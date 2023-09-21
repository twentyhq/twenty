import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      ...userFieldsFragment
      avatarUrl
      canImpersonate
      workspaceMember {
        ...workspaceMemberFieldsFragment
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
