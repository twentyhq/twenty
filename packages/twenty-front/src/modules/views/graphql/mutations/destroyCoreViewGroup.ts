import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation DestroyCoreViewGroup($input: DestroyViewGroupInput!) {
    destroyCoreViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
