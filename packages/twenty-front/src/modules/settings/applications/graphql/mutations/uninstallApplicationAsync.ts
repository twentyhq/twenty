import gql from 'graphql-tag';

export const UNINSTALL_APPLICATION_ASYNC = gql`
  mutation UninstallApplicationAsync($universalIdentifier: String!) {
    uninstallApplicationAsync(universalIdentifier: $universalIdentifier) {
      id
      name
      universalIdentifier
      version
      state
    }
  }
`;
