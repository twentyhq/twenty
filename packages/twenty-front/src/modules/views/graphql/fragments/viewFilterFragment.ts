import { gql } from '@apollo/client';

export const VIEW_FILTER_FRAGMENT = gql`
  fragment ViewFilterFragment on ViewFilter {
    id
    fieldMetadataId
    operand
    value
    viewFilterGroupId
    positionInViewFilterGroup
    subFieldName
    relationTargetFieldMetadataId
    viewId
    createdAt
    updatedAt
    deletedAt
  }
`;
