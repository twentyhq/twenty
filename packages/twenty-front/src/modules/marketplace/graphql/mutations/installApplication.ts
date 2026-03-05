import gql from 'graphql-tag';

export const INSTALL_APPLICATION = gql`
  mutation InstallApplication($appRegistrationId: String!, $version: String) {
    installApplication(appRegistrationId: $appRegistrationId, version: $version)
  }
`;
