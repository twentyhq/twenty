import { gql } from '@apollo/client';

export const NAVIGATION_MENU_ITEM_FRAGMENT = gql`
  fragment NavigationMenuItemFields on NavigationMenuItem {
    id
    userWorkspaceId
    targetRecordId
    targetObjectMetadataId
    viewId
    folderId
    name
    link
    icon
    position
    applicationId
    createdAt
    updatedAt
  }
`;
