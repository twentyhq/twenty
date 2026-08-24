import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { type PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useRef, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

type GetAutocompletePlaceDataParams = {
  address: string;
  country?: string;
  isFieldCity?: boolean;
};

export const usePlaceAutocomplete = (dropdownId: string) => {
  const [placeAutocompleteData, setPlaceAutocompleteData] = useState<
    PlaceAutocompleteResult[]
  >([]);
  const [tokenForPlaceApi, setTokenForPlaceApi] = useState<string | null>(null);
  const tokenForPlaceApiRef = useRef<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const { getPlaceAutocompleteData } = useGetPlaceApiData();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const closeDropdownAndClearResults = useCallback(() => {
    closeDropdown(dropdownId);
    setPlaceAutocompleteData([]);
  }, [closeDropdown, dropdownId]);

  const debouncedGetAutocompletePlaceData = useDebouncedCallback(
    async ({
      address,
      country,
      isFieldCity,
      requestId,
    }: GetAutocompletePlaceDataParams & { requestId: number }) => {
      if (!isNonEmptyString(address.trim())) {
        closeDropdownAndClearResults();
        return;
      }

      const token = tokenForPlaceApiRef.current ?? v4();

      if (token !== tokenForPlaceApiRef.current) {
        tokenForPlaceApiRef.current = token;
        setTokenForPlaceApi(token);
      }

      const autocompleteData = await getPlaceAutocompleteData(
        address,
        token,
        country,
        isFieldCity,
      );

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (!isNonEmptyArray(autocompleteData)) {
        closeDropdownAndClearResults();
        return;
      }

      setPlaceAutocompleteData(autocompleteData);
      openDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
      });
    },
    300,
  );

  const getAutocompletePlaceData = useCallback(
    ({ address, country, isFieldCity }: GetAutocompletePlaceDataParams) => {
      const requestId = ++latestRequestIdRef.current;

      return debouncedGetAutocompletePlaceData({
        address,
        country,
        isFieldCity,
        requestId,
      });
    },
    [debouncedGetAutocompletePlaceData],
  );

  const closePlaceAutocomplete = useCallback(() => {
    latestRequestIdRef.current += 1;
    debouncedGetAutocompletePlaceData.cancel();
    closeDropdownAndClearResults();
  }, [closeDropdownAndClearResults, debouncedGetAutocompletePlaceData]);

  const resetPlaceAutocomplete = useCallback(() => {
    tokenForPlaceApiRef.current = null;
    setTokenForPlaceApi(null);
    closePlaceAutocomplete();
  }, [closePlaceAutocomplete]);

  return {
    placeAutocompleteData,
    tokenForPlaceApi,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  };
};
