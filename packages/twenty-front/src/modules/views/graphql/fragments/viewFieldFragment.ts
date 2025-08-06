import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewFieldDTO {
    id
    fieldMetadataId
    viewId
    isVisible
    position
    size
    aggregateOperation
    createdAt
    updatedAt
    workspaceId
  }
`;
