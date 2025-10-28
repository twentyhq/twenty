import { gql } from '@apollo/client';

export const VIEW_SORT_FRAGMENT = gql`
  fragment ViewSortFragment on CoreViewSort {
    id
    fieldMetadataId
    direction
    viewId
  }
`;
