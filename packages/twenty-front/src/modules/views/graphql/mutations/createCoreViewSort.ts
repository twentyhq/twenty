import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation CreateCoreViewSort($input: CreateViewSortInput!) {
    createCoreViewSort(input: $input) {
      ...ViewSortFragment
    }
  }
`;
