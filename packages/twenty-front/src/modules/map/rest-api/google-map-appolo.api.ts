import { gql } from '@apollo/client';

export const GET_GOOGLE_AUTOCOMPLETE_QUERY = gql`
  query GetGoogleAutoComplete(
    $address: String!
    $token: String!
    $country: String
  ) {
    googleAutocomplete(address: $address, token: $token, country: $country)
      @rest(
        type: "[AutocompleteResult]"
        path: "/place-api/autocomplete?address={args.address}&token={args.token}&country={args.country}"
      ) {
      text
      placeId
    }
  }
`;
export const GET_GOOGLE_PLACE_DETAILS_QUERY = gql`
  query GetGooglePlaceDetails($placeId: String!, $token: String!) {
    googlePlaceDetails(placeId: $placeId, token: $token)
      @rest(
        type: "GooglePlaceDetails"
        path: "/place-api/details?placeId={args.placeId}&token={args.token}"
      ) {
      state
      postcode
      city
      country
    }
  }
`;
