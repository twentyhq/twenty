import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { TextInput } from '@/ui/input/components/TextInput';

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
  onEnter,
  onEscape,
  onClickOutside,
  onChange,
}: AddressInputProps) => {
  const theme = useTheme();

  const [internalValue, setInternalValue] = useState(value);
  const firstInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter,
    onEscape,
    onClickOutside,
    hotkeyScope,
  });

  return (
    <div ref={wrapperRef}>
      <div ref={refs.setFloating} style={floatingStyles}>
        <StyledAddressContainer>
          <TextInput
            value={value.addressStreet1}
            label="ADDRESS"
            fullWidth
            onChange={getChangeHandler('addressStreet1')}
            ref={firstInputRef}
          />
          <TextInput
            value={value.addressStreet2 ?? ''}
            label="ADDRESS 2"
            fullWidth
            onChange={getChangeHandler('addressStreet2')}
          />
          <StyledHalfRowContainer>
            <TextInput
              value={value.addressCity ?? ''}
              label="CITY"
              fullWidth
              onChange={getChangeHandler('addressCity')}
            />
            <TextInput
              value={value.addressState ?? ''}
              label="STATE"
              fullWidth
              onChange={getChangeHandler('addressState')}
            />
          </StyledHalfRowContainer>
          <StyledHalfRowContainer>
            <TextInput
              value={value.addressPostcode ?? ''}
              label="POSTCODE"
              onChange={getChangeHandler('addressPostcode')}
              fullWidth
            />
            <TextInput
              value={value.addressCountry ?? ''}
              label="COUNTRY"
              onChange={getChangeHandler('addressCountry')}
              fullWidth
            />
          </StyledHalfRowContainer>
        </StyledAddressContainer>
      </div>
    </div>
  );
};
