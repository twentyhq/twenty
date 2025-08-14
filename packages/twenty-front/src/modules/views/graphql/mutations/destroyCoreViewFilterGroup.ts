import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_FILTER_GROUP = gql`
  mutation DestroyCoreViewFilterGroup($id: String!) {
    destroyCoreViewFilterGroup(id: $id)
  }
`;
