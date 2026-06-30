import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation UpdateViewSort($input: UpdateViewSortInput!) {
    updateViewSort(input: $input) {
      ...ViewSortFragment
    }
  }
`;
