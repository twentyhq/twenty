import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_GROUP = gql`
  mutation DeleteCoreViewGroup($id: String!) {
    deleteCoreViewGroup(id: $id)
  }
`;
