import { RefObject, useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';
import { Key } from 'ts-key-enum';

import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { TextInputRaw } from '@/ui/input/components/TextInputRaw';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

const StyledAddressContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  padding: 4px 8px;

  width: 100%;
  min-width: 260px;
  > div {
    margin-bottom: 6px;
  }
`;

const StyledHalfRowContainer = styled.div`
  display: flex;
  gap: 8px;
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
  const theme = useTheme();

  const [internalValue, setInternalValue] = useState(value);
  const addressStreet1InputRef = useRef<HTMLInputElement>(null);
  const addressStreet2InputRef = useRef<HTMLInputElement>(null);
  const addressCityInputRef = useRef<HTMLInputElement>(null);
  const addressStateInputRef = useRef<HTMLInputElement>(null);
  const addressPostCodeInputRef = useRef<HTMLInputElement>(null);
  const addressCountryInputRef = useRef<HTMLInputElement>(null);

  const inputRefs: {
    [key in keyof FieldAddressDraftValue]?: RefObject<HTMLInputElement>;
  } = {
    addressStreet1: addressStreet1InputRef,
    addressStreet2: addressStreet2InputRef,
    addressCity: addressCityInputRef,
    addressState: addressStateInputRef,
    addressPostcode: addressPostCodeInputRef,
    addressCountry: addressCountryInputRef,
  };

  const [focusPosition, setFocusPosition] =
    useState<keyof FieldAddressDraftValue>('addressStreet1');

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    placement: 'top-start',
    middleware: [
      flip(),
      offset({
        mainAxis: theme.spacingMultiplicator * 2,
      }),
    ],
  });

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

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      onClickOutside?.(event, internalValue);
    },
    enabled: isDefined(onClickOutside),
  });

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    addressStreet1InputRef.current?.focus();
  }, []);

  return (
    <div ref={refs.setFloating} style={floatingStyles}>
      <StyledAddressContainer ref={wrapperRef}>
        <TextInputRaw
          autoFocus
          value={internalValue.addressStreet1 ?? ''}
          ref={inputRefs['addressStreet1']}
          label="ADDRESS 1"
          fullWidth
          onChange={getChangeHandler('addressStreet1')}
          onFocus={getFocusHandler('addressStreet1')}
        />
        <TextInputRaw
          value={internalValue.addressStreet2 ?? ''}
          ref={inputRefs['addressStreet2']}
          label="ADDRESS 2"
          fullWidth
          onChange={getChangeHandler('addressStreet2')}
          onFocus={getFocusHandler('addressStreet2')}
        />
        <StyledHalfRowContainer>
          <TextInputRaw
            value={internalValue.addressCity ?? ''}
            ref={inputRefs['addressCity']}
            label="CITY"
            fullWidth
            onChange={getChangeHandler('addressCity')}
            onFocus={getFocusHandler('addressCity')}
          />
          <TextInputRaw
            value={internalValue.addressState ?? ''}
            ref={inputRefs['addressState']}
            label="STATE"
            fullWidth
            onChange={getChangeHandler('addressState')}
            onFocus={getFocusHandler('addressState')}
          />
        </StyledHalfRowContainer>
        <StyledHalfRowContainer>
          <TextInputRaw
            value={internalValue.addressPostcode ?? ''}
            ref={inputRefs['addressPostcode']}
            label="POST CODE"
            fullWidth
            onChange={getChangeHandler('addressPostcode')}
            onFocus={getFocusHandler('addressPostcode')}
          />
          <CountrySelect
            onChange={getChangeHandler('addressCountry')}
            selectedCountryName={internalValue.addressCountry ?? ''}
          />
        </StyledHalfRowContainer>
      </StyledAddressContainer>
    </div>
  );
};
