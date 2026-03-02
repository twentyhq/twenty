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
    websiteUrl
    termsUrl
    createdAt
    updatedAt
  }
`;
