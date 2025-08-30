import { VIEW_FILTER_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFilterGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_FILTER_GROUP = gql`
  ${VIEW_FILTER_GROUP_FRAGMENT}
  mutation CreateCoreViewFilterGroup($input: CreateViewFilterGroupInput!) {
    createCoreViewFilterGroup(input: $input) {
      ...ViewFilterGroupFragment
    }
  }
`;
