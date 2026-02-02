import gql from 'graphql-tag';

export const INSTALL_MARKETPLACE_APP = gql`
  mutation InstallMarketplaceApp() {
    installMarketplaceApp()
  }
`;
