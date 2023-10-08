import { gql } from '@apollo/client';

export const UPDATE_FAVORITES_ORDER = gql`
  mutation UpdateFavoritesOrder($data: FavoriteMutationForUpdatingOrder!) {
    updateFavoritesOrder(data: $data)
  }
`;
