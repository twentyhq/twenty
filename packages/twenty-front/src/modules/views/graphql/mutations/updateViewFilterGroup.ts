import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  mutation UpdateViewFilterGroup(
    $id: String!
    $input: UpdateViewFilterGroupInput!
  ) {
    updateViewFilterGroup(id: $id, input: $input) {
      ...ViewFilterGroupFragment
    }
  }
`;
