import { gql } from '@apollo/client';

export const VIEW_GROUP_FRAGMENT = gql`
  fragment ViewGroupFragment on CoreViewGroup {
    id
    fieldMetadataId
    isVisible
    fieldValue
    position
    viewId
  }
`;
