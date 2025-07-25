import {
  GET_GOOGLE_AUTOCOMPLETE_QUERY,
  GET_GOOGLE_PLACE_DETAILS_QUERY,
} from '@/map/rest-api/google-map-appolo.api';
import { PlaceAutocompleteResult, PlaceDetailsResult } from '@/map/types/placeApi';
import { useApolloClient } from '@apollo/client';

export const useGetPlaceApiData = () => {
  const apolloClient = useApolloClient();
  const getPlaceAutocompleteData = async (
    address: string,
    token: string,
    country?: string,
  ): Promise<PlaceAutocompleteResult[] | undefined> => {
    const { data } = await apolloClient.query({
      query: GET_GOOGLE_AUTOCOMPLETE_QUERY,
      variables: { address, token, country },
      fetchPolicy: 'no-cache',
    });

    return data?.googleAutocomplete;
  };
  const getPlaceDetailsData = async (placeId: string, token: string) : Promise<PlaceDetailsResult|undefined>=> {
    const { data } = await apolloClient.query({
      query: GET_GOOGLE_PLACE_DETAILS_QUERY,
      variables: { placeId, token },
      fetchPolicy: 'no-cache',
    });
    return data?.GooglePlaceDetails;
  };
  return {
    getPlaceAutocompleteData,
    getPlaceDetailsData,
  };
};
