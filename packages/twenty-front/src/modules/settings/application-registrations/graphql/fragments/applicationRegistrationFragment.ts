import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_FRAGMENT = gql`
  fragment ApplicationRegistrationFragment on ApplicationRegistration {
    id
    universalIdentifier
    name
    oAuthClientId
    oAuthRedirectUris
    oAuthScopes
    sourceType
    sourcePackage
    latestAvailableVersion
    isListed
    isFeatured
    isPreInstalled
    ownerWorkspaceId
    createdAt
    updatedAt
  }
`;
