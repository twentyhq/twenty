import styled from '@emotion/styled';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';

import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilValue } from 'recoil';
import { isDefined, MOBILE_VIEWPORT } from 'twenty-ui';

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
  value: FieldAddressValue;
  onTab: (newAddress: FieldAddressDraftValue) => void;
  onShiftTab: (newAddress: FieldAddressDraftValue) => void;
  onEnter: (newAddress: FieldAddressDraftValue) => void;
  onEscape: (newAddress: FieldAddressDraftValue) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => void;
  hotkeyScope: string;
  clearable?: boolean;
  onChange?: (updatedValue: FieldAddressDraftValue) => void;
};

export const AddressInput = ({
  value,
  hotkeyScope,
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
  const addressPostCodeInputRef = useRef<HTMLInputElement>(null);

  const inputRefs: {
    [key in keyof FieldAddressDraftValue]?: RefObject<HTMLInputElement>;
  } = {
    addressStreet1: addressStreet1InputRef,
    addressStreet2: addressStreet2InputRef,
    addressCity: addressCityInputRef,
    addressState: addressStateInputRef,
    addressPostcode: addressPostCodeInputRef,
  };

  const [focusPosition, setFocusPosition] =
    useState<keyof FieldAddressDraftValue>('addressStreet1');

  const { closeDropdown: closeCountryDropdown } = useDropdown(
    SELECT_COUNTRY_DROPDOWN_ID,
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  const getChangeHandler =
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      const updatedAddress = { ...value, [field]: updatedAddressPart };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    };

  const getFocusHandler = (fieldName: keyof FieldAddressDraftValue) => () => {
    setFocusPosition(fieldName);

    inputRefs[fieldName]?.current?.focus();
  };

  useScopedHotkeys(
    'tab',
    () => {
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
    },
    hotkeyScope,
    [onTab, internalValue, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
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
    },
    hotkeyScope,
    [onTab, internalValue, focusPosition],
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEnter(internalValue);
    },
    hotkeyScope,
    [onEnter, internalValue],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onEscape(internalValue);
    },
    hotkeyScope,
    [onEscape, internalValue],
  );

  const activeDropdownFocusId = useRecoilValue(activeDropdownFocusIdState);

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      if (activeDropdownFocusId === SELECT_COUNTRY_DROPDOWN_ID) {
        return;
      }

      event.stopImmediatePropagation();

      closeCountryDropdown();
      onClickOutside?.(event, internalValue);
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
        label="ADDRESS 1"
        fullWidth
        onChange={getChangeHandler('addressStreet1')}
        onFocus={getFocusHandler('addressStreet1')}
      />
      <TextInputV2
        value={internalValue.addressStreet2 ?? ''}
        ref={inputRefs['addressStreet2']}
        label="ADDRESS 2"
        fullWidth
        onChange={getChangeHandler('addressStreet2')}
        onFocus={getFocusHandler('addressStreet2')}
      />
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressCity ?? ''}
          ref={inputRefs['addressCity']}
          label="CITY"
          fullWidth
          onChange={getChangeHandler('addressCity')}
          onFocus={getFocusHandler('addressCity')}
        />
        <TextInputV2
          value={internalValue.addressState ?? ''}
          ref={inputRefs['addressState']}
          label="STATE"
          fullWidth
          onChange={getChangeHandler('addressState')}
          onFocus={getFocusHandler('addressState')}
        />
      </StyledHalfRowContainer>
      <StyledHalfRowContainer>
        <TextInputV2
          value={internalValue.addressPostcode ?? ''}
          ref={inputRefs['addressPostcode']}
          label="POST CODE"
          fullWidth
          onChange={getChangeHandler('addressPostcode')}
          onFocus={getFocusHandler('addressPostcode')}
        />
        <CountrySelect
          label="COUNTRY"
          onChange={getChangeHandler('addressCountry')}
          selectedCountryName={internalValue.addressCountry ?? ''}
        />
      </StyledHalfRowContainer>
    </StyledAddressContainer>
  );
};
