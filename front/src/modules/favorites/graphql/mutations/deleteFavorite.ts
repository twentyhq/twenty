import { gql } from '@apollo/client';

export const DELETE_FAVORITE = gql`
  mutation DeleteFavorite($where: FavoriteWhereInput!) {
    deleteFavorite(where: $where) {
      id
    }
  }
`;
