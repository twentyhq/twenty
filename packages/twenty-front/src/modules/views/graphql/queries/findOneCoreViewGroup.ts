import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  query FindOneCoreViewGroup($id: String!) {
    getCoreViewGroup(id: $id) {
      ...ViewGroupFragment
    }
  }
`;
