import { gql } from '@apollo/client';

export const VIEW_FILTER_FRAGMENT = gql`
  fragment ViewFilterFragment on ViewFilter {
    id
    fieldMetadataId
    operand
    value
    viewFilterGroupId
    viewTabId
    positionInViewFilterGroup
    subFieldName
    relationTargetFieldMetadataId
    viewId
    createdAt
    updatedAt
    deletedAt
  }
`;
