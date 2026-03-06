import gql from 'graphql-tag';

export const INSTALL_NPM_APP = gql`
  mutation InstallNpmApp($packageName: String!, $version: String) {
    installNpmApp(packageName: $packageName, version: $version)
  }
`;
