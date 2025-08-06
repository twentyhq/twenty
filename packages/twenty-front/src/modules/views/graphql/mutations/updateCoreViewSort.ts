import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation UpdateCoreViewSort($id: String!, $input: UpdateViewSortInput!) {
    updateCoreViewSort(id: $id, input: $input) {
      ...ViewSortFragment
    }
  }
`;
