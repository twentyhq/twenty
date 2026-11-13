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
    nativePageKey
    icon
    color
    pageLayoutId
    agentChatChannelId
    workflowId
    agentId
    position
    applicationId
    createdAt
    updatedAt
  }
`;
