import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  query FindOneViewGroup($id: String!) {
    getViewGroup(id: $id) {
      ...ViewGroupFragment
    }
  }
`;
