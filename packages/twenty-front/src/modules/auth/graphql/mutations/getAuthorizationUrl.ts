import { gql } from '@apollo/client';

export const GET_AUTHORIZATION_URL = gql`
  mutation GetAuthorizationUrl($input: GetAuthorizationUrlInput!) {
    getAuthorizationUrl(input: $input) {
      id
      type
      authorizationURL
    }
  }
`;
