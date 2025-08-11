import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_CORE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  query FindOneCoreViewSort($id: String!) {
    getCoreViewSort(id: $id) {
      ...ViewSortFragment
    }
  }
`;
