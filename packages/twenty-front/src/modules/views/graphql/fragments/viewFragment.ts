import { gql } from '@apollo/client';

export const VIEW_FRAGMENT = gql`
  fragment ViewFragment on CoreView {
    id
    name
    objectMetadataId
    type
    key
    icon
    position
    isCompact
    openRecordIn
    kanbanAggregateOperation
    kanbanAggregateOperationFieldMetadataId
    createdAt
    updatedAt
    anyFieldFilterValue
  }
`;
