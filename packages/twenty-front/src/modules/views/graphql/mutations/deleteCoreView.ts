import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW = gql`
  mutation DeleteCoreView($id: String!) {
    deleteCoreView(id: $id)
  }
`;
