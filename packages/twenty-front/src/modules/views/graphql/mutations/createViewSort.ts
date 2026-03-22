import { VIEW_SORT_FRAGMENT } from '@/views/graphql/fragments/viewSortFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_SORT = gql`
  ${VIEW_SORT_FRAGMENT}
  mutation CreateViewSort($input: CreateViewSortInput!) {
    createViewSort(input: $input) {
      ...ViewSortFragment
    }
  }
`;
