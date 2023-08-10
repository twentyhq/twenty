import { gql } from '@apollo/client';

export const UPDATE_VIEW_FIELD = gql`
  mutation UpdateViewField(
    $data: ViewFieldUpdateInput!
    $where: ViewFieldWhereUniqueInput!
  ) {
    updateOneViewField(data: $data, where: $where) {
      id
      fieldName
      isVisible
      sizeInPx
      index
    }
  }
`;

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
