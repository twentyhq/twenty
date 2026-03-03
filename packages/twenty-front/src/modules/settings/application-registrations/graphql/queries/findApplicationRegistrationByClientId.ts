import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_BY_CLIENT_ID = gql`
  query FindApplicationRegistrationByClientId($clientId: String!) {
    findApplicationRegistrationByClientId(clientId: $clientId) {
      id
      name
      oAuthScopes
      websiteUrl
      logoUrl
    }
  }
`;
