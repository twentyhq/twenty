import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_SORT = gql`
  mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
    deleteCoreViewSort(input: $input)
  }
`;
