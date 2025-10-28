import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  mutation UpdateCoreViewFilterGroup(
    $id: String!
    $input: UpdateViewFilterGroupInput!
  ) {
    updateCoreViewFilterGroup(id: $id, input: $input) {
      ...ViewFilterGroupFragment
    }
  }
`;
