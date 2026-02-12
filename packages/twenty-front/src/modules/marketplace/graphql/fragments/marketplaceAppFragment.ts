import gql from 'graphql-tag';

export const MARKETPLACE_APP_FRAGMENT = gql`
  fragment MarketplaceAppFields on MarketplaceApp {
    id
    name
    description
    icon
    version
    author
    category
    logo
    screenshots
    aboutDescription
    providers
    websiteUrl
    termsUrl
    objects {
      universalIdentifier
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      fields {
        universalIdentifier
        name
        type
        label
        description
        icon
      }
    }
    fields {
      name
      type
      label
      description
      icon
      objectUniversalIdentifier
    }
    logicFunctions {
      name
      description
      timeoutSeconds
    }
    frontComponents {
      name
      description
    }
    defaultRole {
      id
      label
      description
      canReadAllObjectRecords
      canUpdateAllObjectRecords
      canSoftDeleteAllObjectRecords
      canDestroyAllObjectRecords
      canUpdateAllSettings
      canAccessAllTools
      objectPermissions {
        objectUniversalIdentifier
        canReadObjectRecords
        canUpdateObjectRecords
        canSoftDeleteObjectRecords
        canDestroyObjectRecords
      }
      fieldPermissions {
        objectUniversalIdentifier
        fieldUniversalIdentifier
        canReadFieldValue
        canUpdateFieldValue
      }
      permissionFlags
    }
  }
`;
