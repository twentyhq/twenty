import { gql } from '@apollo/client';

export const FIND_PERSON = gql`
  query FindPerson($filter: PersonFilterInput!) {
    people(filter: $filter) {
      edges {
        node {
          id
          name {
            firstName
            lastName
          }
          linkedinLink {
            url
            label
          }
        }
      }
    }
  }
`;
