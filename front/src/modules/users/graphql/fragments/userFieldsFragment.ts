import { gql } from '@apollo/client';

export const USER_FIELDS_FRAGMENT = gql`
  fragment userFieldsFragment on User {
    id
    email
    displayName
    firstName
    lastName
  }
`;
