import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_CORE_VIEW_FILTERS = gql`
  ${VIEW_FILTER_FRAGMENT}
  query FindManyCoreViewFilters($viewId: String) {
    getCoreViewFilters(viewId: $viewId) {
      ...ViewFilterFragment
    }
  }
`;
