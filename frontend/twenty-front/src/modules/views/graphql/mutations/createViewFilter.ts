import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation CreateViewFilter($input: CreateViewFilterInput!) {
    createViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
