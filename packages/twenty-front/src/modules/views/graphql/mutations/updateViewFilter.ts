import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation UpdateViewFilter($input: UpdateViewFilterInput!) {
    updateViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
