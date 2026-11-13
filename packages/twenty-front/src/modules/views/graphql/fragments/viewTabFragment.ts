import { gql } from '@apollo/client';

export const VIEW_TAB_FRAGMENT = gql`
  fragment ViewTabFragment on ViewTab {
    id
    type
    fieldValue
    name
    position
    isVisible
    viewId
    createdAt
    updatedAt
    deletedAt
  }
`;
