import { gql } from '@apollo/client';

export const INSERT_PERSON_FAVORITE = gql`
  mutation InsertPersonFavorite($data: FavoriteMutationForPersonArgs!) {
    createFavoriteForPerson(data: $data) {
      id
      person {
        id
        firstName
        lastName
        displayName
      }
    }
  }
`;
