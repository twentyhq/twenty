import { gql } from '@apollo/client';
import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';

export const DESTROY_CORE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
    destroyCoreViewSort(input: $input) {
      ...ViewSortFragment
    }
  }
`;
