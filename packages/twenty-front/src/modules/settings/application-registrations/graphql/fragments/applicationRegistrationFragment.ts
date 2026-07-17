import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_FRAGMENT = gql`
  fragment ApplicationRegistrationFragment on ApplicationRegistration {
    id
    universalIdentifier
    name
    logoUrl
    galleryImagesUrls
    oAuthClientId
    oAuthRedirectUris
    oAuthScopes
    sourceType
    sourcePackage
    latestAvailableVersion
    isListed
    isVetted
    isPreInstalled
    isConfigured
    ownerWorkspaceId
    createdAt
    updatedAt
  }
`;
