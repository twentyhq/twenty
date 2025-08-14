import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation UpdateCoreViewGroup($id: String!, $input: UpdateViewGroupInput!) {
    updateCoreViewGroup(id: $id, input: $input) {
      ...ViewGroupFragment
    }
  }
`;
