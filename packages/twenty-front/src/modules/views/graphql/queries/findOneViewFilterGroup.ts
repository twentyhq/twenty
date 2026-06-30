import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  query FindOneViewFilterGroup($id: String!) {
    getViewFilterGroup(id: $id) {
      ...ViewFilterGroupFragment
    }
  }
`;
