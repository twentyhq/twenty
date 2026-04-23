import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const DELETE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation DeleteViewFilter($input: DeleteViewFilterInput!) {
    deleteViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
