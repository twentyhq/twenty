import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW = gql`
  mutation DestroyCoreView($id: String!) {
    destroyCoreView(id: $id)
  }
`;
