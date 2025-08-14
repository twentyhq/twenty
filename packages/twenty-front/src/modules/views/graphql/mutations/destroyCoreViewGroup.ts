import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_GROUP = gql`
  mutation DestroyCoreViewGroup($id: String!) {
    destroyCoreViewGroup(id: $id)
  }
`;
