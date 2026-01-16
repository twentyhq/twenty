import { gql } from '@apollo/client';

export const COMMAND_MENU_ITEM_FRAGMENT = gql`
  fragment CommandMenuItemFields on CommandMenuItem {
    id
    workflowVersionId
    label
    icon
    isPinned
    availabilityType
    availabilityObjectNameSingular
    createdAt
    updatedAt
  }
`;
