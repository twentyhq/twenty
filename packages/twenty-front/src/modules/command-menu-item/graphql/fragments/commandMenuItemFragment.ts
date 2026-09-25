import { gql } from '@apollo/client';

export const COMMAND_MENU_ITEM_FRAGMENT = gql`
  fragment CommandMenuItemFields on CommandMenuItem {
    id
    universalIdentifier
    applicationId
    coreWorkflowVersionId
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
    }
    hotKeys
    conditionalAvailabilityExpression
    conditionalPinnedExpression
    conditionalVariantExpression
    variant
    availabilityType
    availabilityObjectMetadataId
    availabilityFieldMetadataId
    navigationTargetObjectMetadataId
    pageLayoutId
    isActive
  }
`;
