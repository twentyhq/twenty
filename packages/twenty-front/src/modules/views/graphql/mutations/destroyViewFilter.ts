import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const DESTROY_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation DestroyViewFilter($input: DestroyViewFilterInput!) {
    destroyViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
