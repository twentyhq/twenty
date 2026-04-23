import { gql } from '@apollo/client';

export const DELETE_VIEW = gql`
  mutation DeleteView($id: String!) {
    deleteView(id: $id)
  }
`;
