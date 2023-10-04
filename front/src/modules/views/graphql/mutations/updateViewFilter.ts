import { gql } from '@apollo/client';

export const UPDATE_VIEW_FILTER = gql`
  mutation UpdateViewFilter(
    $data: ViewFilterUpdateInput!
    $where: ViewFilterWhereUniqueInput!
  ) {
    viewFilter: updateOneViewFilter(data: $data, where: $where) {
      displayValue
      key
      name
      operand
      value
      multipleValues
    }
  }
`;
