import { gql } from '@apollo/client';

export const CREATE_VIEW_FIELDS = gql`
  mutation CreateViewFields($data: [ViewFieldCreateManyInput!]!) {
    createManyViewField(data: $data) {
      count
    }
  }
`;

export const CREATE_VIEW_SORTS = gql`
  mutation CreateViewSorts($data: [ViewSortCreateManyInput!]!) {
    createManyViewSort(data: $data) {
      count
    }
  }
`;
