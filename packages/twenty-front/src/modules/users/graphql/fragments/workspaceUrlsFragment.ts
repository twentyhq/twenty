import { gql } from '@apollo/client';

export const WORKSPACE_URLS_FRAGMENT = gql`
  fragment WorkspaceUrlsFragment on WorkspaceUrls {
    subdomainUrl
    customUrl
  }
`;
