import { gql } from '@apollo/client';

export const DELETE_VIEW_FILTER_GROUP = gql`
  mutation DeleteViewFilterGroup($id: String!) {
    deleteViewFilterGroup(id: $id)
  }
`;
