import { gql } from '@apollo/client';

export const VIEW_FILTER_GROUP_FRAGMENT = gql`
  fragment ViewFilterGroupFragment on ViewFilterGroup {
    id
    parentViewFilterGroupId
    logicalOperator
    positionInViewFilterGroup
    viewId
  }
`;
