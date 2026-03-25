import gql from 'graphql-tag';

export const UNINSTALL_APPLICATION = gql`
  mutation UninstallApplication($universalIdentifier: String!) {
    uninstallApplication(universalIdentifier: $universalIdentifier)
  }
`;
