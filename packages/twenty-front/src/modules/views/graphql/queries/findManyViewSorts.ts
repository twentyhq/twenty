import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_VIEW_SORTS = gql`
  ${VIEW_SORT_FRAGMENT}
  query FindManyViewSorts($viewId: String) {
    getViewSorts(viewId: $viewId) {
      ...ViewSortFragment
    }
  }
`;
