import { gql } from '@apollo/client';

export const CREATE_VIEW_SORTS = gql`
  mutation CreateViewSorts($data: [ViewSortCreateManyInput!]!) {
    createManyViewSort(data: $data) {
      count
    }
  }
`;
