import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewField {
    id
    fieldMetadataId
    viewId
    isVisible
    isCanonical
    relationTargetFieldMetadataId
    relationAggregateOperation
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
