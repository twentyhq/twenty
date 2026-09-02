import gql from 'graphql-tag';

export const INSTALL_APPLICATION_ASYNC = gql`
  mutation InstallApplicationAsync($universalIdentifier: String!) {
    installApplicationAsync(universalIdentifier: $universalIdentifier) {
      id
      name
      universalIdentifier
      version
      state
    }
  }
`;
