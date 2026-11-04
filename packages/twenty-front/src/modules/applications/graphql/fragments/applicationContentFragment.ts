import { gql } from '@apollo/client';

export const APPLICATION_CONTENT_FRAGMENT = gql`
  fragment ApplicationContentItemFields on ApplicationContentItem {
    universalIdentifier
    label
    icon
    description
    objectUniversalIdentifier
    parentLabel
    tag
    count
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
