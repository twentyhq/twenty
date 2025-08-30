import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation CreateCoreViewGroup($input: CreateViewGroupInput!) {
    createCoreViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
