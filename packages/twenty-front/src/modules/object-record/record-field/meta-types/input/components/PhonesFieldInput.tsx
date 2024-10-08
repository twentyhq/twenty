import { usePhonesField } from '@/object-record/record-field/meta-types/hooks/usePhonesField';
import { PhonesFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/PhonesFieldMenuItem';
import styled from '@emotion/styled';
import { E164Number, parsePhoneNumber } from 'libphonenumber-js';
import { useMemo } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isDefined, TEXT_INPUT_STYLE } from 'twenty-ui';

import { MultiItemFieldInput } from './MultiItemFieldInput';

import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledCustomPhoneInput = styled(ReactPhoneNumberInput)`
  font-family: ${({ theme }) => theme.font.family};
  height: 32px;
  ${TEXT_INPUT_STYLE}
  padding: 0;

  .PhoneInputInput {
    background: none;
    border: none;
    color: ${({ theme }) => theme.font.color.primary};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${({ theme }) => theme.font.color.light};
      font-family: ${({ theme }) => theme.font.family};
      font-weight: ${({ theme }) => theme.font.weight.medium};
    }

    :focus {
      outline: none;
    }
  }

  & svg {
    border-radius: ${({ theme }) => theme.border.radius.xs};
    height: 12px;
  }
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
`;

type PhonesFieldInputProps = {
  onCancel?: () => void;
};

export const PhonesFieldInput = ({ onCancel }: PhonesFieldInputProps) => {
  const { persistPhonesField, hotkeyScope, fieldValue } = usePhonesField();

  const phones = useMemo<{ number: string; countryCode: string }[]>(
    () =>
      [
        fieldValue.primaryPhoneNumber
          ? {
              number: fieldValue.primaryPhoneNumber,
              countryCode: fieldValue.primaryPhoneCountryCode,
            }
          : null,
        ...(fieldValue.additionalPhones ?? []),
      ].filter(isDefined),
    [
      fieldValue.primaryPhoneNumber,
      fieldValue.primaryPhoneCountryCode,
      fieldValue.additionalPhones,
    ],
  );

  const handlePersistPhones = (
    updatedPhones: { number: string; countryCode: string }[],
  ) => {
    const [nextPrimaryPhone, ...nextAdditionalPhones] = updatedPhones;
    persistPhonesField({
      primaryPhoneNumber: nextPrimaryPhone?.number ?? '',
      primaryPhoneCountryCode: nextPrimaryPhone?.countryCode ?? '',
      additionalPhones: nextAdditionalPhones,
    });
  };

  const isPrimaryPhone = (index: number) => index === 0 && phones?.length > 1;

  return (
    <MultiItemFieldInput
      items={phones}
      onPersist={handlePersistPhones}
      onCancel={onCancel}
      placeholder="Phone"
      fieldMetadataType={FieldMetadataType.Phones}
      formatInput={(input) => {
        const phone = parsePhoneNumber(input);
        if (phone !== undefined) {
          return {
            number: phone.nationalNumber,
            countryCode: `+${phone.countryCallingCode}`,
          };
        }
        return {
          number: '',
          countryCode: '',
        };
      }}
      renderItem={({
        value: phone,
        index,
        handleEdit,
        handleSetPrimary,
        handleDelete,
      }) => (
        <PhonesFieldMenuItem
          key={index}
          dropdownId={`${hotkeyScope}-phones-${index}`}
          isPrimary={isPrimaryPhone(index)}
          phone={phone}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
      )}
      renderInput={({ value, onChange, autoFocus, placeholder }) => {
        return (
          <StyledCustomPhoneInput
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={value as E164Number}
            onChange={onChange as unknown as (newValue: E164Number) => void}
            international={true}
            withCountryCallingCode={true}
            countrySelectComponent={PhoneCountryPickerDropdownButton}
          />
        );
      }}
      hotkeyScope={hotkeyScope}
    />
  );
};
