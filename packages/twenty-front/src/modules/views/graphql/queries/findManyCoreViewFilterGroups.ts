import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_CORE_VIEW_FILTER_GROUPS = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  query FindManyCoreViewFilterGroups($viewId: String) {
    getCoreViewFilterGroups(viewId: $viewId) {
      ...ViewFilterGroupFragment
    }
  }
`;
