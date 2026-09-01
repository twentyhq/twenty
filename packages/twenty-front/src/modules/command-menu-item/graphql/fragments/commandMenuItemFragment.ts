import { gql } from '@apollo/client';

export const COMMAND_MENU_ITEM_FRAGMENT = gql`
  fragment CommandMenuItemFields on CommandMenuItem {
    id
    universalIdentifier
    applicationId
    workflowVersionId
    frontComponentId
    frontComponent {
      id
      name
      isHeadless
    }
    engineComponentKey
    label
    icon
    shortLabel
    position
    isPinned
    payload {
      path
    }
    hotKeys
    conditionalAvailabilityExpression
    availabilityType
    availabilityObjectMetadataId
    navigationTargetObjectMetadataId
    pageLayoutId
    isActive
  }
`;
