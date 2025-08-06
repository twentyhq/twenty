import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
    createCoreViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
