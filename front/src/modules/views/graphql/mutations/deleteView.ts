import { gql } from '@apollo/client';

export const DELETE_VIEW = gql`
  mutation DeleteView($where: ViewWhereUniqueInput!) {
    view: deleteOneView(where: $where) {
      id
      name
    }
  }
`;
