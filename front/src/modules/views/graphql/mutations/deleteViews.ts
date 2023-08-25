import { gql } from '@apollo/client';

export const DELETE_VIEWS = gql`
  mutation DeleteViews($where: ViewWhereInput!) {
    deleteManyView(where: $where) {
      count
    }
  }
`;
