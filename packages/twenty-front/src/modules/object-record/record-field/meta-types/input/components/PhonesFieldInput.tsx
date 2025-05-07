import { usePhonesField } from '@/object-record/record-field/meta-types/hooks/usePhonesField';
import { PhonesFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/PhonesFieldMenuItem';
import styled from '@emotion/styled';
import { E164Number, parsePhoneNumber } from 'libphonenumber-js';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { MultiItemFieldInput } from './MultiItemFieldInput';

import { createPhonesFromFieldValue } from '@/object-record/record-field/meta-types/input/utils/phonesUtils';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { css } from '@emotion/react';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const DEFAULT_PHONE_CALLING_CODE = '1';

const StyledCustomPhoneInputContainer = styled.div<{
  hasItem: boolean;
}>`
  ${({ hasItem, theme }) =>
    hasItem &&
    css`
      background-color: ${theme.background.transparent.lighter};
      border-radius: 4px;
      border: 1px solid ${theme.border.color.medium};
      height: 30px;
    `}
`;

const StyledCustomPhoneInput = styled(ReactPhoneNumberInput)`
  ${TEXT_INPUT_STYLE}
  padding: 0;
  height: 100%;

  .PhoneInputInput {
    background: none;
    border: none;
    color: ${({ theme }) => theme.font.color.primary};
    margin-left: ${({ theme }) => theme.spacing(2)};

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
  onClickOutside?: FieldInputClickOutsideEvent;
};

export const PhonesFieldInput = ({
  onCancel,
  onClickOutside,
}: PhonesFieldInputProps) => {
  const { persistPhonesField, fieldValue, fieldDefinition } = usePhonesField();

  const phones = createPhonesFromFieldValue(fieldValue);

  const defaultCountry = stripSimpleQuotesFromString(
    fieldDefinition?.defaultValue?.primaryPhoneCountryCode,
  );

  const handlePersistPhones = (
    updatedPhones: {
      number: string;
      countryCode: string;
      callingCode: string;
    }[],
  ) => {
    const [nextPrimaryPhone, ...nextAdditionalPhones] = updatedPhones;
    persistPhonesField({
      primaryPhoneNumber: nextPrimaryPhone?.number ?? '',
      primaryPhoneCountryCode: nextPrimaryPhone?.countryCode ?? '',
      primaryPhoneCallingCode: nextPrimaryPhone?.callingCode ?? '',
      additionalPhones: nextAdditionalPhones,
    });
  };

  const isPrimaryPhone = (index: number) => index === 0 && phones?.length > 1;

  return (
    <MultiItemFieldInput
      items={phones}
      onPersist={handlePersistPhones}
      onClickOutside={onClickOutside}
      onCancel={onCancel}
      placeholder="Phone"
      fieldMetadataType={FieldMetadataType.PHONES}
      formatInput={(input) => {
        const phone = parsePhoneNumber(input);
        if (phone !== undefined) {
          return {
            number: phone.nationalNumber,
            callingCode: `+${phone.countryCallingCode}`,
            countryCode: phone.country as string,
          };
        }
        return {
          number: '',
          callingCode: '',
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
          dropdownId={`phones-field-input-${fieldDefinition.metadata.fieldName}-${index}`}
          isPrimary={isPrimaryPhone(index)}
          phone={phone}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
      )}
      renderInput={({ value, onChange, autoFocus, placeholder }) => {
        return (
          <StyledCustomPhoneInputContainer hasItem={!!phones.length}>
            <StyledCustomPhoneInput
              autoFocus={autoFocus}
              placeholder={placeholder}
              value={value as E164Number}
              onChange={onChange as unknown as (newValue: E164Number) => void}
              international={true}
              withCountryCallingCode={true}
              countrySelectComponent={PhoneCountryPickerDropdownButton}
              defaultCountry={defaultCountry}
            />
          </StyledCustomPhoneInputContainer>
        );
      }}
      hotkeyScope={DEFAULT_CELL_SCOPE.scope}
    />
  );
};
