import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { type PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

export const usePlaceAutocomplete = (dropdownId: string) => {
  const [placeAutocompleteData, setPlaceAutocompleteData] = useState<
    PlaceAutocompleteResult[]
  >([]);
  const [tokenForPlaceApi, setTokenForPlaceApi] = useState<string | null>(null);

  const { getPlaceAutocompleteData } = useGetPlaceApiData();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const closePlaceAutocomplete = useCallback(() => {
    closeDropdown(dropdownId);
    setPlaceAutocompleteData([]);
  }, [closeDropdown, dropdownId]);

  const resetPlaceAutocomplete = useCallback(() => {
    setTokenForPlaceApi(null);
    closePlaceAutocomplete();
  }, [closePlaceAutocomplete]);

  const getAutocompletePlaceData = useDebouncedCallback(
    async (address: string, country?: string, isFieldCity?: boolean) => {
      if (!isNonEmptyString(address.trim())) {
        closePlaceAutocomplete();
        return;
      }

      const token = tokenForPlaceApi ?? v4();

      if (token !== tokenForPlaceApi) {
        setTokenForPlaceApi(token);
      }

      const autocompleteData = await getPlaceAutocompleteData(
        address,
        token,
        country,
        isFieldCity,
      );

      if (!isNonEmptyArray(autocompleteData)) {
        closePlaceAutocomplete();
        return;
      }

      setPlaceAutocompleteData(autocompleteData);
      openDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
      });
    },
    300,
  );

  return {
    placeAutocompleteData,
    tokenForPlaceApi,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  };
};
