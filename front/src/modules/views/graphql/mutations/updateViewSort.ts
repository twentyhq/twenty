import { gql } from '@apollo/client';

export const UPDATE_VIEW_SORT = gql`
  mutation UpdateViewSort(
    $data: ViewSortUpdateInput!
    $where: ViewSortWhereUniqueInput!
  ) {
    viewSort: updateOneViewSort(data: $data, where: $where) {
      direction
      key
      name
    }
  }
`;
