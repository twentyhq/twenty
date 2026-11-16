import { gql } from '@apollo/client';

export const APPLICATION_CONTENT_FRAGMENT = gql`
  fragment ApplicationContentItemFields on ApplicationContentItem {
    id
    universalIdentifier
    label
    icon
    color
    description
    objectUniversalIdentifier
    parentLabel
    parentUniversalIdentifier
    fieldUniversalIdentifier
    tag
    count
    position
    timeoutSeconds
  }

  fragment ApplicationContentFields on ApplicationContent {
    objects {
      ...ApplicationContentItemFields
    }
    fields {
      ...ApplicationContentItemFields
    }
    indexes {
      ...ApplicationContentItemFields
    }
    views {
      ...ApplicationContentItemFields
    }
    viewFields {
      ...ApplicationContentItemFields
    }
    pageLayouts {
      ...ApplicationContentItemFields
    }
    pageLayoutTabs {
      ...ApplicationContentItemFields
    }
    navigationMenuItems {
      ...ApplicationContentItemFields
    }
    commandMenuItems {
      ...ApplicationContentItemFields
    }
    frontComponents {
      ...ApplicationContentItemFields
    }
    workflows {
      ...ApplicationContentItemFields
    }
    logicFunctions {
      ...ApplicationContentItemFields
    }
    agents {
      ...ApplicationContentItemFields
    }
    skills {
      ...ApplicationContentItemFields
    }
    roles {
      ...ApplicationContentItemFields
    }
    permissionFlags {
      ...ApplicationContentItemFields
    }
    connectionProviders {
      ...ApplicationContentItemFields
    }
    publicAssets {
      ...ApplicationContentItemFields
    }
    translations {
      ...ApplicationContentItemFields
    }
  }
`;
