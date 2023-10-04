import { gql } from '@apollo/client';

export const GET_VIEW_FILTERS = gql`
  query GetViewFilters($where: ViewFilterWhereInput) {
    viewFilters: findManyViewFilter(where: $where) {
      displayValue
      key
      name
      operand
      value
      multipleValues
    }
  }
`;
