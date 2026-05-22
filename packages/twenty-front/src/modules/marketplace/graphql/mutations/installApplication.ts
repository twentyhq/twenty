import gql from 'graphql-tag';

export const INSTALL_APPLICATION = gql`
  mutation InstallApplication($universalIdentifier: String!) {
    installApplication(universalIdentifier: $universalIdentifier) {
      id
    }
  }
`;
