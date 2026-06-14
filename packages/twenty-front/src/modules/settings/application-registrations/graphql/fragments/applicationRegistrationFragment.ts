import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_FRAGMENT = gql`
  fragment ApplicationRegistrationFragment on ApplicationRegistration {
    id
    universalIdentifier
    name
    logoUrl
    oAuthClientId
    oAuthRedirectUris
    oAuthScopes
    sourceType
    sourcePackage
    latestAvailableVersion
    isListed
    isFeatured
    isPreInstalled
    isConfigured
    ownerWorkspaceId
    createdAt
    updatedAt
  }
`;
