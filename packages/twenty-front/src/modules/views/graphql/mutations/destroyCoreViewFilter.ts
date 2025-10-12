import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation DestroyCoreViewFilter($input: DestroyViewFilterInput!) {
    destroyCoreViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
