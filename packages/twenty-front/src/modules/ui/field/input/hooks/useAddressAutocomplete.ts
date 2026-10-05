import { atom, useStore } from 'jotai';
import { useCallback, useState } from 'react';

import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { usePlaceAutocomplete } from '@/geo-map/hooks/usePlaceAutocomplete';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { keepAddressFieldsEditedDuringAutofill } from '@/ui/field/input/utils/keepAddressFieldsEditedDuringAutofill';

import { useCountryUtils } from './useCountryUtils';

export const useAddressAutocomplete = (
  onChange?: (updatedValue: FieldAddressDraftValue) => void,
) => {
  const [typeOfAddressForAutocomplete, setTypeOfAddressForAutocomplete] =
    useState<string | null>(null);
  const [latestPlaceSelectionIdAtom] = useState(() => atom(0));
  const store = useStore();

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
    async ({
      placeId,
      token,
      addressStreet1,
      getInternalValue,
    }: {
      placeId: string;
      token: string;
      addressStreet1?: string;
      getInternalValue?: () => FieldAddressDraftValue;
    }): Promise<FieldAddressDraftValue | undefined> => {
      const placeSelectionId = store.get(latestPlaceSelectionIdAtom) + 1;
      store.set(latestPlaceSelectionIdAtom, placeSelectionId);

      const isLatestPlaceSelection = () =>
        placeSelectionId === store.get(latestPlaceSelectionIdAtom);

      const internalValueAtSelection = getInternalValue?.();
      const placeData = await getPlaceDetailsData(placeId, token).finally(
        () => {
          if (!isLatestPlaceSelection()) {
            return;
          }

          resetPlaceAutocomplete();
          setTypeOfAddressForAutocomplete(null);
        },
      );

      if (!isLatestPlaceSelection()) {
        return undefined;
      }

      const countryName = findCountryNameByCountryCode(placeData?.country);
      const internalValue = getInternalValue?.();

      const autofilledAddress = {
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

      const updatedAddress = keepAddressFieldsEditedDuringAutofill({
        autofilledAddress,
        addressAtSelection: internalValueAtSelection,
        currentAddress: internalValue,
      });

      onChange?.(updatedAddress);

      return updatedAddress;
    },
    [
      store,
      latestPlaceSelectionIdAtom,
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
