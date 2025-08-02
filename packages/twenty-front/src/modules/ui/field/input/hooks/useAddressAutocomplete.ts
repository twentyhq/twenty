import { useCallback, useState } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/selectAutocompleteListDropDownId';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { AllowedAddressSubField } from 'twenty-shared/types';
import { useCountryUtils } from './useCountryUtils';

export const useAddressAutocomplete = (
  onChange?: (updatedValue: FieldAddressDraftValue) => void,
  subFields?: AllowedAddressSubField[] | null,
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
  const IsfieldInputInSubFieldsAddress = (
    field: AllowedAddressSubField,
  ): boolean => {
    if (isDefined(subFields)) {
      return subFields.includes(field);
    }
    return true;
  };
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
        addressStreet1: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? addressStreet1 || (internalValue?.addressStreet1 ?? '')
          : '',
        addressStreet2: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? (internalValue?.addressStreet2 ?? null)
          : null,
        addressCity: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? placeData?.city || (internalValue?.addressCity ?? null)
          : null,
        addressState: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? placeData?.state || (internalValue?.addressState ?? null)
          : null,
        addressCountry: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? countryName || (internalValue?.addressCountry ?? null)
          : null,
        addressPostcode: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? placeData?.postcode || (internalValue?.addressPostcode ?? null)
          : null,
        addressLat: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? (placeData?.location?.lat ?? internalValue?.addressLat ?? null)
          : null,
        addressLng: IsfieldInputInSubFieldsAddress('addressStreet1')
          ? (placeData?.location?.lng ?? internalValue?.addressLng ?? null)
          : null,
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
    IsfieldInputInSubFieldsAddress,
  };
};
