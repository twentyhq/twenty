import { useCallback, useState } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { type PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useCountryUtils } from './useCountryUtils';

export const useAddressAutocomplete = (
  onChange?: (updatedValue: FieldAddressDraftValue) => void,
) => {
  const [placeAutocompleteData, setPlaceAutocompleteData] = useState<
    PlaceAutocompleteResult[] | null
  >([]);
  const [tokenForPlaceApi, setTokenForPlaceApi] = useState<string | null>(null);
  const [typeOfAddressForAutocomplete, setTypeOfAddressForAutocomplete] =
    useState<string | null>(null);

  const { getPlaceAutocompleteData, getPlaceDetailsData } =
    useGetPlaceApiData();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown: closeDropdownHook } = useCloseDropdown();
  const { findCountryNameByCountryCode } = useCountryUtils();

  const openDropdownOfAutocomplete = useCallback(() => {
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID,
    });
  }, [openDropdown]);

  const closeDropdownOfAutocomplete = useCallback(() => {
    closeDropdownHook(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID);
    setPlaceAutocompleteData(null);
    setTypeOfAddressForAutocomplete(null);
  }, [closeDropdownHook]);

  const getAutocompletePlaceData = useDebouncedCallback(
    async (
      address: string,
      token: string,
      country?: string,
      isFieldCity?: boolean,
    ) => {
      const placeAutocompleteData = await getPlaceAutocompleteData(
        address,
        token,
        country,
        isFieldCity,
      );

      const newData = placeAutocompleteData?.map((data) => ({
        text: data.text,
        placeId: data.placeId,
      }));

      if (isDefined(newData) && newData?.length > 0) {
        openDropdownOfAutocomplete();
        setPlaceAutocompleteData(newData);
      } else {
        closeDropdownOfAutocomplete();
      }
    },
    300,
  );

  const autoFillInputsFromPlaceDetails = useCallback(
    async (
      placeId: string,
      token: string,
      addressStreet1?: string,
      internalValue?: FieldAddressDraftValue,
    ) => {
      const placeData = await getPlaceDetailsData(placeId, token);
      const countryName = findCountryNameByCountryCode(placeData?.country);

      const updatedAddress = {
        addressStreet1: addressStreet1 || (internalValue?.addressStreet1 ?? ''),
        addressStreet2: internalValue?.addressStreet2 ?? null,
        addressCity: placeData?.city || (internalValue?.addressCity ?? null),
        addressState: placeData?.state || (internalValue?.addressState ?? null),
        addressCountry: countryName || (internalValue?.addressCountry ?? null),
        addressPostcode:
          placeData?.postcode || (internalValue?.addressPostcode ?? null),
        addressLat:
          placeData?.location?.lat ?? internalValue?.addressLat ?? null,
        addressLng:
          placeData?.location?.lng ?? internalValue?.addressLng ?? null,
      };

      setTokenForPlaceApi(null);
      closeDropdownOfAutocomplete();
      onChange?.(updatedAddress);

      return updatedAddress;
    },
    [
      getPlaceDetailsData,
      findCountryNameByCountryCode,
      closeDropdownOfAutocomplete,
      onChange,
    ],
  );

  return {
    placeAutocompleteData,
    tokenForPlaceApi,
    typeOfAddressForAutocomplete,
    setTokenForPlaceApi,
    setTypeOfAddressForAutocomplete,
    getAutocompletePlaceData,
    autoFillInputsFromPlaceDetails,
    closeDropdownOfAutocomplete,
  };
};
