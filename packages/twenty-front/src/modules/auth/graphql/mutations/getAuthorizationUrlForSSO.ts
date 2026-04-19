import { gql } from '@apollo/client';

export const GET_AUTHORIZATION_URL_FOR_Sso = gql`
  mutation GetAuthorizationUrlForSso($input: GetAuthorizationUrlForSsoInput!) {
    getAuthorizationUrlForSso(input: $input) {
      id
      type
      authorizationURL
    }
  }
`;
