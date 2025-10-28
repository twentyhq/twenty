import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  query FindOneCoreViewFilter($id: String!) {
    getCoreViewFilter(id: $id) {
      ...ViewFilterFragment
    }
  }
`;
