import { gql } from '@apollo/client';

export const APP_REGISTRATION_FRAGMENT = gql`
  fragment AppRegistrationFragment on AppRegistration {
    id
    universalIdentifier
    name
    description
    logoUrl
    author
    clientId
    redirectUris
    scopes
    websiteUrl
    termsUrl
    createdAt
    updatedAt
  }
`;

export const FIND_MANY_APP_REGISTRATIONS = gql`
  query FindManyAppRegistrations {
    findManyAppRegistrations {
      ...AppRegistrationFragment
    }
  }
  ${APP_REGISTRATION_FRAGMENT}
`;

export const FIND_ONE_APP_REGISTRATION = gql`
  query FindOneAppRegistration($id: String!) {
    findOneAppRegistration(id: $id) {
      ...AppRegistrationFragment
    }
  }
  ${APP_REGISTRATION_FRAGMENT}
`;

export const FIND_APP_REGISTRATION_STATS = gql`
  query FindAppRegistrationStats($id: String!) {
    findAppRegistrationStats(id: $id) {
      activeInstalls
      latestVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;

export const FIND_APP_REGISTRATION_VARIABLES = gql`
  query FindAppRegistrationVariables($appRegistrationId: String!) {
    findAppRegistrationVariables(appRegistrationId: $appRegistrationId) {
      id
      key
      description
      isSecret
      isRequired
      isFilled
      createdAt
      updatedAt
    }
  }
`;
