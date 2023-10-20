import { gql } from '@apollo/client';

export const UPDATE_FAVORITE = gql`
  mutation UpdateOneFavorite(
    $data: FavoriteUpdateInput!
    $where: FavoriteWhereUniqueInput!
  ) {
    updateOneFavorites(data: $data, where: $where) {
      id
      person {
        id
        firstName
        lastName
        avatarUrl
      }
      company {
        id
        name
        domainName
        accountOwner {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;
