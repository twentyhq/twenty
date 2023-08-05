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

export const INSERT_COMPANY_FAVORITE = gql`
  mutation InsertCompanyFavorite($data: FavoriteMutationForCompanyArgs!) {
    createFavoriteForCompany(data: $data) {
      id
      company {
        id
        name
        domainName
      }
    }
  }
`;

export const DELETE_FAVORITE = gql`
  mutation DeleteFavorite($where: FavoriteWhereInput!) {
    deleteFavorite(where: $where) {
      id
    }
  }
`;
