import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_VIEW_GROUPS = gql`
  ${VIEW_GROUP_FRAGMENT}
  query FindManyViewGroups($viewId: String) {
    getViewGroups(viewId: $viewId) {
      ...ViewGroupFragment
    }
  }
`;
