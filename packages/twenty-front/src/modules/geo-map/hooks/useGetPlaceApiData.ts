import {
  GET_AUTOCOMPLETE_QUERY,
  GET_PLACE_DETAILS_QUERY,
} from '@/geo-map/graphql-query/geo-map-appolo.api';
import {
  type PlaceAutocompleteResult,
  type PlaceDetailsResult,
} from '@/geo-map/types/placeApi';
import { useApolloClient } from '@apollo/client';

export const useGetPlaceApiData = () => {
  const apolloClient = useApolloClient();
  const getPlaceAutocompleteData = async (
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<PlaceAutocompleteResult[] | undefined> => {
    const { data } = await apolloClient.query({
      query: GET_AUTOCOMPLETE_QUERY,
      variables: { address, token, country, isFieldCity: isFieldCity ?? false },
      fetchPolicy: 'no-cache',
    });

    return data?.getAutoCompleteAddress;
  };
  const getPlaceDetailsData = async (
    placeId: string,
    token: string,
  ): Promise<PlaceDetailsResult | undefined> => {
    const { data } = await apolloClient.query({
      query: GET_PLACE_DETAILS_QUERY,
      variables: { placeId, token },
      fetchPolicy: 'no-cache',
    });
    return data?.getAddressDetails;
  };
  return {
    getPlaceAutocompleteData,
    getPlaceDetailsData,
  };
};
