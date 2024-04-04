import { gql } from '@apollo/client';

export const FIND_PERSON = gql`
  query FindPerson($filter: PersonFilterInput!) {
    people(filter: $filter) {
      edges {
        node {
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
