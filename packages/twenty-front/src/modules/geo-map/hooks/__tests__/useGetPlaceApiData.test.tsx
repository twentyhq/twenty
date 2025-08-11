import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import {
  GET_AUTOCOMPLETE_QUERY,
  GET_PLACE_DETAILS_QUERY,
} from '@/geo-map/graphql-query/geo-map-appolo.api';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import {
  type PlaceAutocompleteResult,
  type PlaceDetailsResult,
} from '@/geo-map/types/placeApi';

const mockAutocompleteResults: PlaceAutocompleteResult[] = [
  {
    placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
    text: 'Paris, France',
  },
  {
    placeId: 'ChIJOwg_06VPwokRYv534QaPC8g',
    text: 'New York, NY, USA',
  },
];

const mockPlaceDetails: PlaceDetailsResult = {
  city: 'Paris',
  country: 'France',
  state: 'Île-de-France',
  postcode: '75001',
};

const createWrapper = (mocks: MockedResponse[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useGetPlaceApiData', () => {
  describe('getPlaceAutocompleteData', () => {
    it('should fetch autocomplete data successfully', async () => {
      const mocks = [
        {
          request: {
            query: GET_AUTOCOMPLETE_QUERY,
            variables: {
              address: 'Paris',
              token: 'test-token',
              country: 'FR',
              isFieldCity: false,
            },
          },
          result: {
            data: {
              getAutoCompleteAddress: mockAutocompleteResults,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      const data = await result.current.getPlaceAutocompleteData(
        'Paris',
        'test-token',
        'FR',
        false,
      );

      await waitFor(() => {
        expect(data).toEqual(mockAutocompleteResults);
      });
    });

    it('should handle autocomplete query with minimal parameters', async () => {
      const mocks = [
        {
          request: {
            query: GET_AUTOCOMPLETE_QUERY,
            variables: {
              address: 'London',
              token: 'test-token',
              country: undefined,
              isFieldCity: false,
            },
          },
          result: {
            data: {
              getAutoCompleteAddress: mockAutocompleteResults,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      const data = await result.current.getPlaceAutocompleteData(
        'London',
        'test-token',
      );

      await waitFor(() => {
        expect(data).toEqual(mockAutocompleteResults);
      });
    });

    it('should handle autocomplete query errors', async () => {
      const mocks = [
        {
          request: {
            query: GET_AUTOCOMPLETE_QUERY,
            variables: {
              address: 'Invalid',
              token: 'test-token',
              country: undefined,
              isFieldCity: false,
            },
          },
          error: new Error('Network error'),
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      await expect(
        result.current.getPlaceAutocompleteData('Invalid', 'test-token'),
      ).rejects.toThrow('Network error');
    });

    it('should return undefined when autocomplete data is null', async () => {
      const mocks = [
        {
          request: {
            query: GET_AUTOCOMPLETE_QUERY,
            variables: {
              address: 'Empty',
              token: 'test-token',
              country: undefined,
              isFieldCity: false,
            },
          },
          result: {
            data: {
              getAutoCompleteAddress: null,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      const data = await result.current.getPlaceAutocompleteData(
        'Empty',
        'test-token',
      );

      await waitFor(() => {
        expect(data).toBeNull();
      });
    });
  });

  describe('getPlaceDetailsData', () => {
    it('should fetch place details successfully', async () => {
      const mocks = [
        {
          request: {
            query: GET_PLACE_DETAILS_QUERY,
            variables: {
              placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
              token: 'test-token',
            },
          },
          result: {
            data: {
              getAddressDetails: mockPlaceDetails,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      const data = await result.current.getPlaceDetailsData(
        'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        'test-token',
      );

      await waitFor(() => {
        expect(data).toEqual(mockPlaceDetails);
      });
    });

    it('should handle place details query errors', async () => {
      const mocks = [
        {
          request: {
            query: GET_PLACE_DETAILS_QUERY,
            variables: {
              placeId: 'invalid-place-id',
              token: 'test-token',
            },
          },
          error: new Error('Place not found'),
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      await expect(
        result.current.getPlaceDetailsData('invalid-place-id', 'test-token'),
      ).rejects.toThrow('Place not found');
    });

    it('should return undefined when place details data is null', async () => {
      const mocks = [
        {
          request: {
            query: GET_PLACE_DETAILS_QUERY,
            variables: {
              placeId: 'empty-place-id',
              token: 'test-token',
            },
          },
          result: {
            data: {
              getAddressDetails: null,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      const data = await result.current.getPlaceDetailsData(
        'empty-place-id',
        'test-token',
      );

      await waitFor(() => {
        expect(data).toBeNull();
      });
    });
  });

  describe('integration tests', () => {
    it('should handle both queries in sequence', async () => {
      const mocks = [
        {
          request: {
            query: GET_AUTOCOMPLETE_QUERY,
            variables: {
              address: 'Paris',
              token: 'test-token',
              country: undefined,
              isFieldCity: false,
            },
          },
          result: {
            data: {
              getAutoCompleteAddress: mockAutocompleteResults,
            },
          },
        },
        {
          request: {
            query: GET_PLACE_DETAILS_QUERY,
            variables: {
              placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
              token: 'test-token',
            },
          },
          result: {
            data: {
              getAddressDetails: mockPlaceDetails,
            },
          },
        },
      ];

      const { result } = renderHook(() => useGetPlaceApiData(), {
        wrapper: createWrapper(mocks),
      });

      // First get autocomplete results
      const autocompleteData = await result.current.getPlaceAutocompleteData(
        'Paris',
        'test-token',
      );

      await waitFor(() => {
        expect(autocompleteData).toEqual(mockAutocompleteResults);
      });

      // Then get place details for the first result
      const placeDetailsData = await result.current.getPlaceDetailsData(
        'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        'test-token',
      );

      await waitFor(() => {
        expect(placeDetailsData).toEqual(mockPlaceDetails);
      });
    });
  });
});
