import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  query FindOneCoreViewFilterGroup($id: String!) {
    getCoreViewFilterGroup(id: $id) {
      ...ViewFilterGroupFragment
    }
  }
`;
