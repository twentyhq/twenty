import { gql } from '@apollo/client';

export const DESTROY_VIEW = gql`
  mutation DestroyView($id: String!) {
    destroyView(id: $id)
  }
`;
