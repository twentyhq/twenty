import styled from '@emotion/styled';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/selectAutocompleteListDropDownId';
import { useGetPlaceApiData } from '@/geo-map/hooks/useGetPlaceApiData';
import { PlaceAutocompleteResult } from '@/geo-map/types/placeApi';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { TEXT_INPUT_CLICK_OUTSIDE_ID } from '@/ui/input/components/constants/TextInputClickOutsideId';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

const StyledAddressContainer = styled.div`
  padding: 4px 8px;

  width: 344px;
  > div {
    margin-bottom: 6px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: auto;
    min-width: 100px;
    max-width: 200px;
    overflow: hidden;
    > div {
      margin-bottom: 8px;
    }
  }
`;

const StyledHalfRowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    > div {
      margin-bottom: 7px;
    }
  }
`;

export type AddressInputProps = {
  instanceId: string;
  value: FieldAddressValue;
  onTab: (newAddress: FieldAddressDraftValue) => void;
  onShiftTab: (newAddress: FieldAddressDraftValue) => void;
  onEnter: (newAddress: FieldAddressDraftValue) => void;
  onEscape: (newAddress: FieldAddressDraftValue) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => void;
  clearable?: boolean;
  onChange?: (updatedValue: FieldAddressDraftValue) => void;
};

export const AddressInput = ({
  instanceId,
  value,
  onTab,
  onShiftTab,
  onEnter,
  onEscape,
  onClickOutside,
  onChange,
}: AddressInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const addressStreet1InputRef = useRef<HTMLInputElement>(null);
  const addressStreet2InputRef = useRef<HTMLInputElement>(null);
  const addressCityInputRef = useRef<HTMLInputElement>(null);
  const addressStateInputRef = useRef<HTMLInputElement>(null);
  const addressPostcodeInputRef = useRef<HTMLInputElement>(null);
  const [placeAutocompleteData, setPlaceAutocompleteData] = useState<
    PlaceAutocompleteResult[] | null
  >([]);
  const [tokenForPlaceApi, setTokenForPlaceApi] = useState<string | null>(null);
  const [typeOfAddressForAutocomplete, setTypeOfAddressForAutocomplete] =
    useState<string | null>(null);
  const inputRefs: {
    [key in keyof FieldAddressDraftValue]?: RefObject<HTMLInputElement>;
  } = {
    addressStreet1: addressStreet1InputRef,
    addressStreet2: addressStreet2InputRef,
    addressCity: addressCityInputRef,
    addressState: addressStateInputRef,
    addressPostcode: addressPostcodeInputRef,
  };
  const { getPlaceAutocompleteData, getPlaceDetailsData } =
    useGetPlaceApiData();
  const [focusPosition, setFocusPosition] =
    useState<keyof FieldAddressDraftValue>('addressStreet1');
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const countries = useCountries();
  const findCountryCodeByCountryName = (countryName?: string): string => {
    if (!isDefined(countryName) || countryName === '') return '';

    const foundCountry = countries.find(
      (country) => country.countryName === countryName,
    );
    return foundCountry?.countryCode ?? '';
  };
  const findCountryNameByCountryCode = (
    countryCode?: string,
  ): string | null => {
    if (!isDefined(countryCode) || countryCode === '') return '';

    const foundCountry = countries.find(
      (country) => country.countryCode === countryCode,
    );

    return foundCountry?.countryName ?? null;
  };

  const getChangeHandler =
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      const updatedAddress = { ...value, [field]: updatedAddressPart };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
      if (field === 'addressStreet1' || field === 'addressCity') {
        const token = tokenForPlaceApi ?? v4();
        if (token !== tokenForPlaceApi) {
          setTokenForPlaceApi(token);
        }
        const countryCode = findCountryCodeByCountryName(
          updatedAddress.addressCountry ?? '',
        );
        if (field !== typeOfAddressForAutocomplete) {
          setTypeOfAddressForAutocomplete(field);
        }
        const isFieldCity = field === 'addressCity';
        getAutocompletePlaceData(
          updatedAddressPart,
          token,
          countryCode,
          isFieldCity,
        );
      }
    };
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
  const openDropdownOfAutocomplete = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID,
    });
  };
  const closeDropdownOfAutocomplete = () => {
    closeDropdown(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID);
    setPlaceAutocompleteData(null);
    setTypeOfAddressForAutocomplete(null);
  };
  const autoFillInputsFromPlaceDetails = async (
    placeId: string,
    token: string,
    addressStreet1?: string,
  ) => {
    const placeData = await getPlaceDetailsData(placeId, token);

    const countryName = findCountryNameByCountryCode(placeData?.country);
    const updatedAddress = {
      addressStreet1: addressStreet1
        ? addressStreet1
        : (internalValue.addressStreet1 ?? ''),
      addressStreet2: internalValue.addressStreet2 ?? null,
      addressCity: placeData?.city
        ? placeData.city
        : (internalValue.addressCity ?? null),
      addressState: placeData?.state
        ? placeData.state
        : (internalValue.addressState ?? null),
      addressCountry: countryName
        ? countryName
        : (internalValue.addressCountry ?? null),
      addressPostcode: placeData?.postcode
        ? placeData?.postcode
        : (internalValue.addressPostcode ?? null),
      addressLat: internalValue.addressLat ?? null,
      addressLng: internalValue.addressLng ?? null,
    };
    setTokenForPlaceApi(null);
    setInternalValue(updatedAddress);
    onChange?.(updatedAddress);
    closeDropdownOfAutocomplete();
  };
  const handlePlaceSelection = (placeId: string) => {
    const placeAutocomplete = placeAutocompleteData?.find(
      (place) => place.placeId === placeId,
    );
    const token = tokenForPlaceApi ?? '';
    if (!isDefined(placeAutocomplete)) return;
    const text: string | undefined =
      typeOfAddressForAutocomplete !== 'addressCity'
        ? placeAutocomplete.text
        : undefined;
    autoFillInputsFromPlaceDetails(placeId, token, text);
  };
  const getFocusHandler = (fieldName: keyof FieldAddressDraftValue) => () => {
    setFocusPosition(fieldName);

    inputRefs[fieldName]?.current?.focus();
  };

  const handleTab = () => {
    const currentFocusPosition = Object.keys(inputRefs).findIndex(
      (key) => key === focusPosition,
    );
    const maxFocusPosition = Object.keys(inputRefs).length - 1;

    const nextFocusPosition = currentFocusPosition + 1;

    const isFocusPositionAfterLast = nextFocusPosition > maxFocusPosition;

    if (isFocusPositionAfterLast) {
      onTab?.(internalValue);
    } else {
      const nextFocusFieldName = Object.keys(inputRefs)[
        nextFocusPosition
      ] as keyof FieldAddressDraftValue;

      setFocusPosition(nextFocusFieldName);
      inputRefs[nextFocusFieldName]?.current?.focus();
    }
  };
  const handleClickOutside = () => {
    setPlaceAutocompleteData(null);
    setTypeOfAddressForAutocomplete(null);
  };
  const handleShiftTab = () => {
    const currentFocusPosition = Object.keys(inputRefs).findIndex(
      (key) => key === focusPosition,
    );

    const nextFocusPosition = currentFocusPosition - 1;

    const isFocusPositionBeforeFirst = nextFocusPosition < 0;

    if (isFocusPositionBeforeFirst) {
      onShiftTab?.(internalValue);
    } else {
      const nextFocusFieldName = Object.keys(inputRefs)[
        nextFocusPosition
      ] as keyof FieldAddressDraftValue;

      setFocusPosition(nextFocusFieldName);
      inputRefs[nextFocusFieldName]?.current?.focus();
    }
  };

  useHotkeysOnFocusedElement({
    keys: ['tab'],
    callback: handleTab,
    focusId: instanceId,
    dependencies: [handleTab],
  });

  useHotkeysOnFocusedElement({
    keys: ['shift+tab'],
    callback: handleShiftTab,
    focusId: instanceId,
    dependencies: [handleShiftTab],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      onEnter(internalValue);
      closeDropdownOfAutocomplete();
    },
    focusId: instanceId,
    dependencies: [onEnter, internalValue],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onEscape(internalValue);
      closeDropdownOfAutocomplete();
    },
    focusId: instanceId,
    dependencies: [onEscape, internalValue],
  });

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      if (
        activeDropdownFocusId === SELECT_COUNTRY_DROPDOWN_ID ||
        activeDropdownFocusId === SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID
      ) {
        return;
      }

      event.stopImmediatePropagation();

      onClickOutside?.(event, internalValue);
      setPlaceAutocompleteData(null);
      setTypeOfAddressForAutocomplete(null);
    },
    enabled: isDefined(onClickOutside),
    listenerId: 'address-input',
  });

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <StyledAddressContainer ref={wrapperRef}>
      <TextInputV2
        autoFocus
        value={internalValue.addressStreet1 ?? ''}
        ref={inputRefs['addressStreet1']}
        label="Address 1"
        fullWidth
        onChange={getChangeHandler('addressStreet1')}
        onFocus={getFocusHandler('addressStreet1')}
        textClickOutsideId={
          placeAutocompleteData &&
          placeAutocompleteData?.length > 0 &&
          typeOfAddressForAutocomplete === 'addressStreet1'
            ? TEXT_INPUT_CLICK_OUTSIDE_ID
            : undefined
        }
      />
      {placeAutocompleteData && placeAutocompleteData?.length > 0 && (
        <PlaceAutocompleteSelect
          list={placeAutocompleteData}
          onChange={handlePlaceSelection}
          dropdownId={SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID}
          excludedClickOutsideIds={[TEXT_INPUT_CLICK_OUTSIDE_ID]}
          onClickOutside={handleClickOutside}
          dropdownOffset={
            typeOfAddressForAutocomplete === 'addressCity'
              ? { x: 5, y: 180 }
              : { x: 5, y: 57 }
          }
        />
      )}
      <TextInputV2
        value={internalValue.addressStreet2 ?? ''}
        ref={inputRefs['addressStreet2']}
        label="Address 2"
        fullWidth
        onChange={getChangeHandler('addressStreet2')}
        onFocus={getFocusHandler('addressStreet2')}
      />
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressCity ?? ''}
          ref={inputRefs['addressCity']}
          label="City"
          fullWidth
          onChange={getChangeHandler('addressCity')}
          onFocus={getFocusHandler('addressCity')}
          textClickOutsideId={
            placeAutocompleteData &&
            placeAutocompleteData?.length > 0 &&
            typeOfAddressForAutocomplete === 'addressCity'
              ? TEXT_INPUT_CLICK_OUTSIDE_ID
              : undefined
          }
        />
        <TextInputV2
          value={internalValue.addressState ?? ''}
          ref={inputRefs['addressState']}
          label="State"
          fullWidth
          onChange={getChangeHandler('addressState')}
          onFocus={getFocusHandler('addressState')}
        />
      </StyledHalfRowContainer>
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressPostcode ?? ''}
          ref={inputRefs['addressPostcode']}
          label="Post Code"
          fullWidth
          onChange={getChangeHandler('addressPostcode')}
          onFocus={getFocusHandler('addressPostcode')}
        />
        <CountrySelect
          label="Country"
          onChange={getChangeHandler('addressCountry')}
          selectedCountryName={internalValue.addressCountry ?? ''}
        />
      </StyledHalfRowContainer>
    </StyledAddressContainer>
  );
};
