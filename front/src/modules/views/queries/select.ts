import { gql } from '@apollo/client';

export const GET_VIEW_FIELDS = gql`
  query GetViewFields(
    $where: ViewFieldWhereInput
    $orderBy: [ViewFieldOrderByWithRelationInput!]
  ) {
    viewFields: findManyViewField(where: $where, orderBy: $orderBy) {
      id
      fieldName
      isVisible
      sizeInPx
      index
    }
  }
`;

export const GET_VIEW_SORTS = gql`
  query GetViewSorts($where: ViewSortWhereInput) {
    viewSorts: findManyViewSort(where: $where) {
      direction
      key
      name
    }
  }
`;
