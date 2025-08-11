import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_FILTER = gql`
  mutation DestroyCoreViewFilter($id: String!) {
    destroyCoreViewFilter(id: $id)
  }
`;
