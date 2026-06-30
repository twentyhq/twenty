import { gql } from '@apollo/client';

export const DESTROY_VIEW_SORT = gql`
  mutation DestroyViewSort($input: DestroyViewSortInput!) {
    destroyViewSort(input: $input)
  }
`;
