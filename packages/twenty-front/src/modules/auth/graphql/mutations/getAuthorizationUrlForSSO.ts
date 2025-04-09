import { gql } from '@apollo/client';

export const GET_AUTHORIZATION_URL_FOR_SSO = gql`
  mutation GetAuthorizationUrlForSSO($input: GetAuthorizationUrlForSSOInput!) {
    getAuthorizationUrlForSSO(input: $input) {
      id
      type
      authorizationURL
    }
  }
`;
