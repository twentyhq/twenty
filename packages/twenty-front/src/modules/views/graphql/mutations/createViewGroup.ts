import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_GROUP = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation CreateViewGroup($input: CreateViewGroupInput!) {
    createViewGroup(input: $input) {
      ...ViewGroupFragment
    }
  }
`;
