import { gql } from '@apollo/client';

export const DELETE_VIEW_SORT = gql`
  mutation DeleteViewSort($input: DeleteViewSortInput!) {
    deleteViewSort(input: $input)
  }
`;
