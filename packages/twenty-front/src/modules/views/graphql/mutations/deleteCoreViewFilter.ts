import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FILTER = gql`
  mutation DeleteCoreViewFilter($id: String!) {
    deleteCoreViewFilter(id: $id)
  }
`;
