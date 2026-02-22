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
    label
    icon
    isPinned
    availabilityType
    availabilityObjectMetadataId
  }
`;
