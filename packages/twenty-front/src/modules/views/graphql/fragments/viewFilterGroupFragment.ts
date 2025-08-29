import { gql } from '@apollo/client';

export const VIEW_FILTER_GROUP_FRAGMENT = gql`
  fragment ViewFilterGroupFragment on CoreViewFilterGroup {
    id
    parentViewFilterGroupId
    logicalOperator
    positionInViewFilterGroup
    viewId
  }
`;
