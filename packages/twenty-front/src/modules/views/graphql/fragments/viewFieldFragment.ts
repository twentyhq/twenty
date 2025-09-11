import { gql } from '@apollo/client';

export const VIEW_FIELD_FRAGMENT = gql`
  fragment ViewFieldFragment on CoreViewField {
    id
    fieldMetadataId
    viewId
    isVisible
    position
    size
    aggregateOperation
    createdAt
    updatedAt
    deletedAt
  }
`;
