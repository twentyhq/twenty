import { gql } from '@apollo/client';

export const CREATE_VIEW_FILTERS = gql`
  mutation CreateViewFilters($data: [ViewFilterCreateManyInput!]!) {
    createManyViewFilter(data: $data) {
      count
    }
  }
`;
