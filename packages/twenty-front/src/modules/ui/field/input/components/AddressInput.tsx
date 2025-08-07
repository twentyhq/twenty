import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/selectAutocompleteListDropDownId';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { TextInput } from '@/ui/input/components/TextInput';
import { TEXT_INPUT_CLICK_OUTSIDE_ID } from '@/ui/input/components/constants/TextInputClickOutsideId';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { AllowedAddressSubField } from 'twenty-shared/types';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import { useCountryUtils } from '../hooks/useCountryUtils';
import { useFocusManagement } from '../hooks/useFocusManagement';

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
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    > div {
      margin-bottom: 7px;
    }
  }
`;

const StyledInputWithDropdownContainer = styled.div`
  position: relative;
  width: 100%;
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
  subFields?: AllowedAddressSubField[] | null;
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
  subFields,
}: AddressInputProps) => {
  const [internalValue, setInternalValue] = useState(value);

  const addressStreet1InputRef = useRef<HTMLInputElement>(null);
  const addressStreet2InputRef = useRef<HTMLInputElement>(null);
  const addressCityInputRef = useRef<HTMLInputElement>(null);
  const addressStateInputRef = useRef<HTMLInputElement>(null);
  const addressPostcodeInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const inputRefs = useMemo(
    () => ({
      addressStreet1: addressStreet1InputRef,
      addressStreet2: addressStreet2InputRef,
      addressCity: addressCityInputRef,
      addressState: addressStateInputRef,
      addressPostcode: addressPostcodeInputRef,
    }),
    [],
  );

  const { findCountryCodeByCountryName } = useCountryUtils();

  const {
    placeAutocompleteData,
    tokenForPlaceApi,
    typeOfAddressForAutocomplete,
    setTokenForPlaceApi,
    setTypeOfAddressForAutocomplete,
    getAutocompletePlaceData,
    autoFillInputsFromPlaceDetails,
    closeDropdownOfAutocomplete,
  } = useAddressAutocomplete(onChange);

  const isFieldInputInSubFieldsAddress = useCallback(
    (field: AllowedAddressSubField): boolean => {
      if (isDefined(subFields)) {
        return subFields.includes(field);
      }
      return true;
    },
    [subFields],
  );

  const { getFocusHandler, handleTab, handleShiftTab } = useFocusManagement(
    inputRefs,
    internalValue,
    onTab,
    onShiftTab,
  );

  const getChangeHandler = useCallback(
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      if (isDefined(subFields) && !subFields.includes(field)) {
        return;
      }
      const updatedAddress = { ...internalValue, [field]: updatedAddressPart };
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
    },
    [
      internalValue,
      onChange,
      tokenForPlaceApi,
      setTokenForPlaceApi,
      findCountryCodeByCountryName,
      typeOfAddressForAutocomplete,
      setTypeOfAddressForAutocomplete,
      getAutocompletePlaceData,
      subFields,
    ],
  );

  const handlePlaceSelection = useCallback(
    (placeId: string) => {
      const placeAutocomplete = placeAutocompleteData?.find(
        (place) => place.placeId === placeId,
      );
      const token = tokenForPlaceApi ?? '';
      if (!isDefined(placeAutocomplete)) return;

      const text: string | undefined =
        typeOfAddressForAutocomplete !== 'addressCity'
          ? placeAutocomplete.text
          : undefined;

      autoFillInputsFromPlaceDetails(placeId, token, text, internalValue);
    },
    [
      placeAutocompleteData,
      tokenForPlaceApi,
      typeOfAddressForAutocomplete,
      autoFillInputsFromPlaceDetails,
      internalValue,
    ],
  );

  const handleClickOutside = useCallback(() => {
    closeDropdownOfAutocomplete();
  }, [closeDropdownOfAutocomplete]);

  const handleEnter = useCallback(() => {
    onEnter(internalValue);
    closeDropdownOfAutocomplete();
  }, [onEnter, internalValue, closeDropdownOfAutocomplete]);

  const handleEscape = useCallback(() => {
    onEscape(internalValue);
    closeDropdownOfAutocomplete();
  }, [onEscape, internalValue, closeDropdownOfAutocomplete]);

  const handleOutsideClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      onClickOutside?.(event, internalValue);
      closeDropdownOfAutocomplete();
    },
    [onClickOutside, internalValue, closeDropdownOfAutocomplete],
  );

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter: handleEnter,
    onEscape: handleEscape,
    onTab: handleTab,
    onShiftTab: handleShiftTab,
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
      handleOutsideClick(event);
    },
    enabled: isDefined(onClickOutside),
    listenerId: 'address-input',
  });

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const validAutocompleteData = useMemo(
    () =>
      placeAutocompleteData && placeAutocompleteData.length > 0
        ? placeAutocompleteData
        : null,
    [placeAutocompleteData],
  );

  const renderInputWithAutocomplete = (
    inputElement: React.ReactNode | null,
    fieldType: 'addressStreet1' | 'addressCity',
  ) => {
    const shouldShowDropdown =
      validAutocompleteData && typeOfAddressForAutocomplete === fieldType;

    if (!shouldShowDropdown) {
      return inputElement;
    }

    return (
      <StyledInputWithDropdownContainer>
        <Dropdown
          dropdownId={SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID}
          dropdownPlacement="bottom-start"
          excludedClickOutsideIds={[
            TEXT_INPUT_CLICK_OUTSIDE_ID,
            SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID,
          ]}
          disableClickForClickableComponent={true}
          onClickOutside={handleClickOutside}
          clickableComponent={inputElement}
          dropdownComponents={
            <PlaceAutocompleteSelect
              list={validAutocompleteData}
              onChange={handlePlaceSelection}
              dropdownId={SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID}
            />
          }
        />
      </StyledInputWithDropdownContainer>
    );
  };

  return (
    <StyledAddressContainer ref={wrapperRef}>
      {isFieldInputInSubFieldsAddress('addressStreet1') &&
        renderInputWithAutocomplete(
          <TextInput
            autoFocus
            value={internalValue.addressStreet1 ?? ''}
            ref={inputRefs.addressStreet1}
            label="Address 1"
            fullWidth
            onChange={getChangeHandler('addressStreet1')}
            onFocus={getFocusHandler('addressStreet1')}
            textClickOutsideId={
              validAutocompleteData &&
              typeOfAddressForAutocomplete === 'addressStreet1'
                ? TEXT_INPUT_CLICK_OUTSIDE_ID
                : undefined
            }
          />,
          'addressStreet1',
        )}
      {isFieldInputInSubFieldsAddress('addressStreet2') && (
        <TextInput
          value={internalValue.addressStreet2 ?? ''}
          ref={inputRefs.addressStreet2}
          label="Address 2"
          fullWidth
          onChange={getChangeHandler('addressStreet2')}
          onFocus={getFocusHandler('addressStreet2')}
        />
      )}
      <StyledHalfRowContainer>
        {isFieldInputInSubFieldsAddress('addressCity') &&
          renderInputWithAutocomplete(
            <TextInput
              value={internalValue.addressCity ?? ''}
              ref={inputRefs.addressCity}
              label="City"
              fullWidth
              onChange={getChangeHandler('addressCity')}
              onFocus={getFocusHandler('addressCity')}
              textClickOutsideId={
                validAutocompleteData &&
                typeOfAddressForAutocomplete === 'addressCity'
                  ? TEXT_INPUT_CLICK_OUTSIDE_ID
                  : undefined
              }
            />,
            'addressCity',
          )}
        {isFieldInputInSubFieldsAddress('addressState') && (
          <TextInput
            value={internalValue.addressState ?? ''}
            ref={inputRefs.addressState}
            label="State"
            fullWidth
            onChange={getChangeHandler('addressState')}
            onFocus={getFocusHandler('addressState')}
          />
        )}
      </StyledHalfRowContainer>
      <StyledHalfRowContainer>
        {isFieldInputInSubFieldsAddress('addressPostcode') && (
          <TextInput
            value={internalValue.addressPostcode ?? ''}
            ref={inputRefs.addressPostcode}
            label="Post Code"
            fullWidth
            onChange={getChangeHandler('addressPostcode')}
            onFocus={getFocusHandler('addressPostcode')}
          />
        )}
        {isFieldInputInSubFieldsAddress('addressCountry') && (
          <CountrySelect
            label="Country"
            onChange={getChangeHandler('addressCountry')}
            selectedCountryName={internalValue.addressCountry ?? ''}
          />
        )}
      </StyledHalfRowContainer>
    </StyledAddressContainer>
  );
};
