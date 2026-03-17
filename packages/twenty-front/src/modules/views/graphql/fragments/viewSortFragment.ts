import { gql } from '@apollo/client';

export const VIEW_SORT_FRAGMENT = gql`
  fragment ViewSortFragment on ViewSort {
    id
    fieldMetadataId
    direction
    viewId
    createdAt
    deletedAt
    updatedAt
  }
`;
