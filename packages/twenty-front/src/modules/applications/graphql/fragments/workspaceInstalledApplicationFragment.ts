import { gql } from '@apollo/client';

export const WORKSPACE_INSTALLED_APPLICATION_FRAGMENT = gql`
  fragment WorkspaceInstalledApplication on Application {
    runHealthCheckOnUserPreferences
    id
    name
    description
    universalIdentifier
    logoUrl
    createdAt
  }
`;
