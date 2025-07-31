import { gql } from '@apollo/client';

export const AUTH_TOKEN = gql`
  fragment AuthTokenFragment on AuthToken {
    token
    expiresAt
  }
`;

export const AUTH_TOKEN_PAIR = gql`
  fragment AuthTokenPairFragment on AuthTokenPair {
    accessOrWorkspaceAgnosticToken {
      ...AuthTokenFragment
    }
    refreshToken {
      ...AuthTokenFragment
    }
  }
`;

export const AVAILABLE_WORKSPACE_FOR_AUTH_FRAGMENT = gql`
  fragment AvailableWorkspaceFragment on AvailableWorkspace {
    id
    displayName
    loginToken
    inviteHash
    personalInviteToken
    workspaceUrls {
      subdomainUrl
      customUrl
    }
    logo
    sso {
      type
      id
      issuer
      name
      status
    }
  }
`;

export const AVAILABLE_WORKSPACES_FOR_AUTH_FRAGMENT = gql`
  fragment AvailableWorkspacesFragment on AvailableWorkspaces {
    availableWorkspacesForSignIn {
      ...AvailableWorkspaceFragment
    }
    availableWorkspacesForSignUp {
      ...AvailableWorkspaceFragment
    }
  }
`;
