import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const DESTROY_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation DestroyViewGroup($input: DestroyViewGroupInput!) {
    destroyViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
