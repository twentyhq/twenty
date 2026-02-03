import { gql } from '@apollo/client';
import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';

export const DELETE_CORE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
    deleteCoreViewSort(input: $input) {
      ...ViewSortFragment
    }
  }
`;
