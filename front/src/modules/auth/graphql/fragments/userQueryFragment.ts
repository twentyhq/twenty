import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    email
    displayName
    firstName
    lastName
    canImpersonate
    supportUserHash
  }
`;
