import { gql } from '@apollo/client';

export const VIEW_GROUP_FRAGMENT = gql`
  fragment ViewGroupFragment on ViewGroup {
    id
    isVisible
    fieldValue
    position
    viewId
    createdAt
    updatedAt
    deletedAt
  }
`;
