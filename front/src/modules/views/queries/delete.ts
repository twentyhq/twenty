import { gql } from '@apollo/client';

export const DELETE_VIEW_SORTS = gql`
  mutation DeleteViewSorts($where: ViewSortWhereInput!) {
    deleteManyViewSort(where: $where) {
      count
    }
  }
`;
