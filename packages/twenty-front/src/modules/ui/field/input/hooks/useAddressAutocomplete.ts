import { useCallback, useState } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';

import { useCountryUtils } from './useCountryUtils';

export const useAddressAutocomplete = (
  onChange?: (updatedValue: FieldAddressDraftValue) => void,
) => {
  const [typeOfAddressForAutocomplete, setTypeOfAddressForAutocomplete] =
    useState<string | null>(null);

  const { getPlaceDetailsData } = useGetPlaceApiData();
  const { findCountryNameByCountryCode } = useCountryUtils();

  const {
    placeAutocompleteData,
    tokenForPlaceApi,
    getAutocompletePlaceData,
    closePlaceAutocomplete,
    resetPlaceAutocomplete,
  } = usePlaceAutocomplete(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID);

  const closeDropdownOfAutocomplete = useCallback(() => {
    closePlaceAutocomplete();
    setTypeOfAddressForAutocomplete(null);
  }, [closePlaceAutocomplete]);

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
        addressStreet1:
          placeData?.street ||
          addressStreet1 ||
          (internalValue?.addressStreet1 ?? ''),
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

      resetPlaceAutocomplete();
      setTypeOfAddressForAutocomplete(null);
      onChange?.(updatedAddress);

      return updatedAddress;
    },
    [
      getPlaceDetailsData,
      findCountryNameByCountryCode,
      resetPlaceAutocomplete,
      onChange,
    ],
  );

  return {
    placeAutocompleteData,
    tokenForPlaceApi,
    typeOfAddressForAutocomplete,
    setTypeOfAddressForAutocomplete,
    getAutocompletePlaceData,
    autoFillInputsFromPlaceDetails,
    closeDropdownOfAutocomplete,
  };
};
