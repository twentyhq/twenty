import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  query FindOneViewFilter($id: String!) {
    getViewFilter(id: $id) {
      ...ViewFilterFragment
    }
  }
`;
