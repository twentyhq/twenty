import gql from 'graphql-tag';

export const MARKETPLACE_APP_DETAIL_FRAGMENT = gql`
  fragment MarketplaceAppDetailFields on MarketplaceAppDetail {
    id
    universalIdentifier
    name
    sourceType
    sourcePackage
    latestAvailableVersion
    logo
    isListed
    isFeatured
    manifest
  }
`;
