import { gql } from '@apollo/client';

export const NAVIGATION_MENU_ITEM_FRAGMENT = gql`
  fragment NavigationMenuItemFields on NavigationMenuItem {
    id
    type
    userWorkspaceId
    targetRecordId
    targetObjectMetadataId
    viewId
    folderId
    name
    link
    icon
    color
    pageLayoutId
    agentChatChannelId
    position
    applicationId
    createdAt
    updatedAt
  }
`;
