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

type IsFieldInputInSubFieldsAddressProps = {
  field: AllowedAddressSubField;
};

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
  const isFieldInputInSubFieldsAddress = useCallback(
    ({ field }: IsFieldInputInSubFieldsAddressProps): boolean => {
      if (isDefined(subFields)) {
        return subFields.includes(field);
      }
      return true;
    },
    [subFields],
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
        addressStreet1: isFieldInputInSubFieldsAddress({
          field: 'addressStreet1',
        })
          ? addressStreet1 || (internalValue?.addressStreet1 ?? '')
          : '',
        addressStreet2: isFieldInputInSubFieldsAddress({
          field: 'addressStreet2',
        })
          ? (internalValue?.addressStreet2 ?? null)
          : null,
        addressCity: isFieldInputInSubFieldsAddress({ field: 'addressCity' })
          ? placeData?.city || (internalValue?.addressCity ?? null)
          : null,
        addressState: isFieldInputInSubFieldsAddress({ field: 'addressState' })
          ? placeData?.state || (internalValue?.addressState ?? null)
          : null,
        addressCountry: isFieldInputInSubFieldsAddress({
          field: 'addressCountry',
        })
          ? countryName || (internalValue?.addressCountry ?? null)
          : null,
        addressPostcode: isFieldInputInSubFieldsAddress({
          field: 'addressPostcode',
        })
          ? placeData?.postcode || (internalValue?.addressPostcode ?? null)
          : null,
        addressLat: isFieldInputInSubFieldsAddress({ field: 'addressLat' })
          ? (placeData?.location?.lat ?? internalValue?.addressLat ?? null)
          : null,
        addressLng: isFieldInputInSubFieldsAddress({ field: 'addressLng' })
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
      isFieldInputInSubFieldsAddress,
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
    isFieldInputInSubFieldsAddress,
  };
};
