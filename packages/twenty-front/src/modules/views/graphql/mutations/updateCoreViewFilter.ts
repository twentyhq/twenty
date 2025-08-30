import { VIEW_FILTER_FRAGMENT } from '@/views/graphql/fragments/viewFilterFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_FILTER = gql`
  ${VIEW_FILTER_FRAGMENT}
  mutation UpdateCoreViewFilter($id: String!, $input: UpdateViewFilterInput!) {
    updateCoreViewFilter(id: $id, input: $input) {
      ...ViewFilterFragment
    }
  }
`;
