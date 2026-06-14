import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewField {
    id
    fieldMetadataId
    viewId
    isVisible
    position
    size
    aggregateOperation
    viewFieldGroupId
    isActive
    createdAt
    updatedAt
    deletedAt
  }
`;
