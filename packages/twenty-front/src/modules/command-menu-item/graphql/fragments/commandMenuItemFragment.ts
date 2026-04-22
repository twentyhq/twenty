import { gql } from '@apollo/client';

export const COMMAND_MENU_ITEM_FRAGMENT = gql`
  fragment CommandMenuItemFields on CommandMenuItem {
    id
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
      ... on PathCommandMenuItemPayload {
        path
      }
      ... on ObjectMetadataCommandMenuItemPayload {
        objectMetadataItemId
      }
    }
    hotKeys
    conditionalAvailabilityExpression
    availabilityType
    availabilityObjectMetadataId
    pageLayoutId
  }
`;
