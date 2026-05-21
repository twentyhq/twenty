import gql from 'graphql-tag';

export const INSTALL_MARKETPLACE_APP = gql`
  mutation InstallApplication(
    $universalIdentifier: String!
    $version: String
  ) {
    installApplication(
      universalIdentifier: $universalIdentifier
      version: $version
    ) {
      id
    }
  }
`;
