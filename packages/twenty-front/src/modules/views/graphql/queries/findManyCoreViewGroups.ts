import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_CORE_VIEW_GROUPS = gql`
  ${VIEW_GROUP_FRAGMENT}
  query FindManyCoreViewGroups($viewId: String) {
    getCoreViewGroups(viewId: $viewId) {
      ...ViewGroupFragment
    }
  }
`;
