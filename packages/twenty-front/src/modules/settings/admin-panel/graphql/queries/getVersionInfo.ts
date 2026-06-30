import { gql } from '@apollo/client';

export const GET_VERSION_INFO = gql`
  query GetVersionInfo {
    versionInfo {
      currentVersion
      latestVersion
    }
  }
`;
