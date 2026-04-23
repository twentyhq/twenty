import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation UpdateViewGroup($input: UpdateViewGroupInput!) {
    updateViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
