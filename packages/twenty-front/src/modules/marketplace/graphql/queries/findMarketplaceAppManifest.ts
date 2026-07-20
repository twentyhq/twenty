import gql from 'graphql-tag';

export const FIND_MARKETPLACE_APP_MANIFEST = gql`
  query FindMarketplaceAppManifest($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      id
      manifest
    }
  }
`;
