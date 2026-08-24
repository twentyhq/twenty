import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { type PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isNonEmptyString } from '@sniptt/guards';
import { atom, useAtomValue, useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

type GetAutocompletePlaceDataParams = {
  address: string;
  country?: string;
  isFieldCity?: boolean;
};

type PlaceAutocompleteSession = {
  tokenForPlaceApi: string | null;
  latestRequestId: number;
};

export const usePlaceAutocomplete = (dropdownId: string) => {
  const [placeAutocompleteData, setPlaceAutocompleteData] = useState<
    PlaceAutocompleteResult[]
  >([]);
  const [placeAutocompleteSessionAtom] = useState(() =>
    atom<PlaceAutocompleteSession>({
      tokenForPlaceApi: null,
      latestRequestId: 0,
    }),
  );
  const placeAutocompleteSession = useAtomValue(placeAutocompleteSessionAtom);
  const store = useStore();

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

      const currentSession = store.get(placeAutocompleteSessionAtom);
      const token = currentSession.tokenForPlaceApi ?? v4();

      if (token !== currentSession.tokenForPlaceApi) {
        store.set(placeAutocompleteSessionAtom, (latestSession) => ({
          ...latestSession,
          tokenForPlaceApi: latestSession.tokenForPlaceApi ?? token,
        }));
      }

      const autocompleteData = await getPlaceAutocompleteData(
        address,
        token,
        country,
        isFieldCity,
      );

      if (
        requestId !== store.get(placeAutocompleteSessionAtom).latestRequestId
      ) {
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
      const currentSession = store.get(placeAutocompleteSessionAtom);
      const requestId = currentSession.latestRequestId + 1;

      store.set(placeAutocompleteSessionAtom, {
        ...currentSession,
        latestRequestId: requestId,
      });

      return debouncedGetAutocompletePlaceData({
        address,
        country,
        isFieldCity,
        requestId,
      });
    },
    [debouncedGetAutocompletePlaceData, placeAutocompleteSessionAtom, store],
  );

  const closePlaceAutocomplete = useCallback(() => {
    store.set(placeAutocompleteSessionAtom, (currentSession) => ({
      ...currentSession,
      latestRequestId: currentSession.latestRequestId + 1,
    }));
    debouncedGetAutocompletePlaceData.cancel();
    closeDropdownAndClearResults();
  }, [
    closeDropdownAndClearResults,
    debouncedGetAutocompletePlaceData,
    placeAutocompleteSessionAtom,
    store,
  ]);

  const resetPlaceAutocomplete = useCallback(() => {
    store.set(placeAutocompleteSessionAtom, (currentSession) => ({
      ...currentSession,
      tokenForPlaceApi: null,
    }));
    closePlaceAutocomplete();
  }, [closePlaceAutocomplete, placeAutocompleteSessionAtom, store]);

  return {
    placeAutocompleteData,
    tokenForPlaceApi: placeAutocompleteSession.tokenForPlaceApi,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  };
};
