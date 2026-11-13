import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on ViewField {
    id
    fieldMetadataId
    viewId
    isVisible
    isCanonical
    position
    size
    aggregateOperation
    viewFieldGroupId
    settings {
      label
      recordLimit
    }
    isActive
    createdAt
    updatedAt
    deletedAt
  }
`;
