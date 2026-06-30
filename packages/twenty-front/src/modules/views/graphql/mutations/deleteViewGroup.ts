import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const DELETE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation DeleteViewGroup($input: DeleteViewGroupInput!) {
    deleteViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
