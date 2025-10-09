import { gql } from '@apollo/client';

export const VIEW_FILTER_FRAGMENT = gql`
  fragment ViewFilterFragment on CoreViewFilter {
    id
    fieldMetadataId
    operand
    value
    viewFilterGroupId
    positionInViewFilterGroup
    subFieldName
    viewId
    createdAt
    updatedAt
    deletedAt
  }
`;
