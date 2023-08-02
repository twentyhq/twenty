import { gql } from '@apollo/client';

export const INSERT_MANY_FAVORITES = gql`
  mutation InsertManyFavorites($data: [FavoriteCreateManyInput!]!) {
    createFavorites(data: $data) {
      id
      person {
        id
        firstName
        lastName
        displayName
      }
      company {
        id
        name
        domainName
      }
    }
  }
`;
