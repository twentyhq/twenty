import { gql } from '@apollo/client';

export const GET_VIEW_SORTS = gql`
  query GetViewSorts($where: ViewSortWhereInput) {
    viewSorts: findManyViewSort(where: $where) {
      direction
      key
      name
    }
  }
`;
