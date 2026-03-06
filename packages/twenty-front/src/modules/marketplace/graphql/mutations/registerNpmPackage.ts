import { gql } from '@apollo/client';

export const REGISTER_NPM_PACKAGE = gql`
  mutation RegisterNpmPackage($packageName: String!) {
    registerNpmPackage(packageName: $packageName) {
      id
      universalIdentifier
      name
    }
  }
`;
