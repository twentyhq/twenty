import { gql } from '@apollo/client';

export const APPLICATION_REGISTRATION_FRAGMENT = gql`
  fragment ApplicationRegistrationFragment on ApplicationRegistration {
    id
    universalIdentifier
    name
    description
    logoUrl
    author
    oAuthClientId
    oAuthRedirectUris
    oAuthScopes
    sourceType
    sourcePackage
    latestAvailableVersion
    websiteUrl
    termsUrl
    isListed
    isFeatured
    ownerWorkspaceId
    createdAt
    updatedAt
  }
`;
