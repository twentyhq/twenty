import { gql } from '@apollo/client';

export const GET_AUTOCOMPLETE_QUERY = gql`
  query GetAutoCompleteAddress(
    $address: String!
    $token: String!
    $country: String
    $isFieldCity: Boolean
  ) {
    getAutoCompleteAddress(
      address: $address
      token: $token
      country: $country
      isFieldCity: $isFieldCity
    ) {
      text
      placeId
    }
  }
`;

export const GET_PLACE_DETAILS_QUERY = gql`
  query GetAddressDetails($placeId: String!, $token: String!) {
    getAddressDetails(placeId: $placeId, token: $token) {
      state
      postcode
      city
      country
      location {
        lat
        lng
      }
    }
  }
`;
