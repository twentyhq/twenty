import { gql } from '@apollo/client';

export const DELETE_VIEW_FILTERS = gql`
  mutation DeleteViewFilters($where: ViewFilterWhereInput!) {
    deleteManyViewFilter(where: $where) {
      count
    }
  }
`;
