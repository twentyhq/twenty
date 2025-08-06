import { gql } from '@apollo/client';

export const VIEW_SORT_FRAGMENT = gql`
  fragment ViewSortFragment on ViewSortDTO {
    id
    fieldMetadataId
    direction
    viewId
    createdAt
    updatedAt
    workspaceId
  }
`;
