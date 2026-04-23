import gql from 'graphql-tag';

export const INSTALL_MARKETPLACE_APP = gql`
  mutation InstallMarketplaceApp(
    $universalIdentifier: String!
    $version: String
  ) {
    installMarketplaceApp(
      universalIdentifier: $universalIdentifier
      version: $version
    )
  }
`;
