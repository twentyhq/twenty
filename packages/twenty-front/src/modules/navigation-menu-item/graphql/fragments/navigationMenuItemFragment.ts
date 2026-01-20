import { gql } from '@apollo/client';

export const NAVIGATION_MENU_ITEM_FRAGMENT = gql`
  fragment NavigationMenuItemFields on NavigationMenuItem {
    id
    forWorkspaceMemberId
    targetRecordId
    targetObjectMetadataId
    favoriteFolderId
    position
    applicationId
    createdAt
    updatedAt
  }
`;
