import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation DeleteCoreViewGroup($input: DeleteViewGroupInput!) {
    deleteCoreViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
