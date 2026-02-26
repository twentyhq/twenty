import { gql } from '@apollo/client';

export const FIND_APP_REGISTRATION_BY_CLIENT_ID = gql`
  query FindAppRegistrationByClientId($clientId: String!) {
    findAppRegistrationByClientId(clientId: $clientId) {
      id
      name
      scopes
      websiteUrl
      logoUrl
    }
  }
`;
