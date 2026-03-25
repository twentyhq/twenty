import { gql } from '@apollo/client';

export const DESTROY_VIEW_FILTER_GROUP = gql`
  mutation DestroyViewFilterGroup($id: String!) {
    destroyViewFilterGroup(id: $id)
  }
`;
