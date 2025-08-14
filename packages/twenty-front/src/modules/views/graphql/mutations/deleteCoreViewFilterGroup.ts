import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FILTER_GROUP = gql`
  mutation DeleteCoreViewFilterGroup($id: String!) {
    deleteCoreViewFilterGroup(id: $id)
  }
`;
