import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_SORT = gql`
  mutation DeleteCoreViewSort($id: String!) {
    deleteCoreViewSort(id: $id)
  }
`;
