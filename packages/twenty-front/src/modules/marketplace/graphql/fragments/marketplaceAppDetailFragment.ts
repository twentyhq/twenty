import gql from 'graphql-tag';

export const MARKETPLACE_APP_DETAIL_FRAGMENT = gql`
  fragment MarketplaceAppDetailFields on MarketplaceAppDetail {
    id
    universalIdentifier
    name
    sourceType
    sourcePackage
    latestAvailableVersion
    isListed
    isVetted
    description
    author
    category
    logo
    websiteUrl
    aboutDescription
    termsUrl
    emailSupport
    issueReportUrl
    galleryImages
    defaultRoleUniversalIdentifier
    roles {
      universalIdentifier
      label
      description
      icon
      canUpdateAllSettings
      canAccessAllTools
      canReadAllObjectRecords
      canUpdateAllObjectRecords
      canSoftDeleteAllObjectRecords
      canDestroyAllObjectRecords
      permissionFlagUniversalIdentifiers
      objectPermissions {
        universalIdentifier
        objectUniversalIdentifier
        canReadObjectRecords
        canUpdateObjectRecords
        canSoftDeleteObjectRecords
        canDestroyObjectRecords
      }
      fieldPermissions {
        universalIdentifier
        objectUniversalIdentifier
        fieldUniversalIdentifier
        canReadFieldValue
        canUpdateFieldValue
      }
    }
  }
`;
