import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewField {
    id
    fieldMetadataId
    viewId
    isVisible
    isCanonical
    relationTargetFieldMetadataId
    relationScope {
      filters {
        id
        fieldMetadataId
        operand
        value
        subFieldName
        relationTargetFieldMetadataId
        filterGroupId
      }
      filterGroups {
        id
        parentFilterGroupId
        logicalOperator
      }
      sorts {
        fieldMetadataId
        direction
        subFieldName
        relationTargetFieldMetadataId
      }
      limit
    }
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
