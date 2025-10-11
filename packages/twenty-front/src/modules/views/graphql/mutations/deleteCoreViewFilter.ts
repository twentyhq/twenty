import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation DeleteCoreViewFilter($input: DeleteViewFilterInput!) {
    deleteCoreViewFilter(input: $input) {
      ...ViewFilterFragment
    }
  }
`;
