import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID = gql`
  query FindApplicationRegistrationByclientId($clientId: String!) {
    findApplicationRegistrationByclientId(clientId: $clientId) {
      id
      logoUrl
      name
      oAuthScopes
      websiteUrl
    }
  }
`;
