import { gql } from '@apollo/client';

export const NAVIGATION_MENU_ITEM_FRAGMENT = gql`
  fragment NavigationMenuItemFields on NavigationMenuItem {
    id
    type
    userWorkspaceId
    targetRecordId
    targetObjectMetadataId
    viewId
    parentId
    name
    link
    nativePageKey
    builtInSectionKey
    icon
    color
    pageLayoutId
    agentChatChannelId
    workflowId
    agentId
    position
    applicationId
    universalIdentifier
    isActive
    createdAt
    updatedAt
  }
`;
