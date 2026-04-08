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
    payload
    hotKeys
    conditionalAvailabilityExpression
    availabilityType
    availabilityObjectMetadataId
  }
`;
