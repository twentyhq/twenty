import { gql } from '@apollo/client';

export const INSERT_PERSON_FRAGMENT = gql`
  fragment InsertPersonFragment on Person {
    id
    firstName
    lastName
    displayName
    createdAt
  }
`;
