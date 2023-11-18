import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    email
    firstName
    lastName
    canImpersonate
  }
`;
