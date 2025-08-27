import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_SORT = gql`
  mutation DestroyCoreViewSort($id: String!) {
    destroyCoreViewSort(id: $id)
  }
`;
