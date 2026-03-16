import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  mutation CreateViewFilterGroup($input: CreateViewFilterGroupInput!) {
    createViewFilterGroup(input: $input) {
      ...ViewFilterGroupFragment
    }
  }
`;
