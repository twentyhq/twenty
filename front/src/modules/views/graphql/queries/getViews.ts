import { gql } from '@apollo/client';

export const GET_VIEWS = gql`
  query GetViews($where: ViewWhereInput) {
    views: findManyView(where: $where) {
      id
      name
    }
  }
`;
