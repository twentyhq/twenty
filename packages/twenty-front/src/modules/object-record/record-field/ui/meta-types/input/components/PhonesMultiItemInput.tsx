import { t } from '@lingui/core/macro';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { phoneSchema } from '@/object-record/record-field/ui/validation-schemas/phoneSchema';
import { styled } from '@linaria/react';
import {
  parsePhoneNumber,
  type CountryCode,
  type E164Number,
} from 'libphonenumber-js';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { MultiItemFieldInput } from './MultiItemFieldInput';

import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledCustomPhoneInputContainer = styled.div<{
  hasItem: boolean;
  hasError?: boolean;
}>`
  background-color: ${({ hasItem }) =>
    hasItem ? themeCssVariables.background.transparent.lighter : 'transparent'};
  border: ${({ hasItem, hasError }) =>
    hasItem
      ? hasError
        ? `1px solid ${themeCssVariables.border.color.danger}`
        : `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ hasItem }) => (hasItem ? '4px' : '0')};
  height: ${({ hasItem }) => (hasItem ? '30px' : 'auto')};

  &[data-framed='true'] {
    align-self: stretch;
    flex: 1;
    height: auto;
    min-width: 0;
  }
`;

const StyledCustomPhoneInputWrapper = styled.div`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  height: 100%;
  width: calc(100% - ${themeCssVariables.spacing[8]});

  &[data-framed='true'] {
    width: 100%;
  }

  .PhoneInput {
    height: 100%;
  }

  .PhoneInputInput {
    background: none;
    border: none;
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    height: 100%;
    padding-left: ${themeCssVariables.spacing[2]};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${themeCssVariables.font.color.light};
      font-family: ${themeCssVariables.font.family};
      font-weight: ${themeCssVariables.font.weight.medium};
    }

    &:focus {
      outline: none;
    }
  }
`;

type PhonesMultiItemInputProps = {
  value: FieldPhonesValue | null | undefined;
  fieldName: string;
  defaultCountry?: CountryCode;
  maxNumberOfValues?: number | null;
  variant?: FieldInputVariant;
  placeholder?: string;
  onChange: (value: FieldPhonesValue) => void;
  onEnter?: (value: FieldPhonesValue | undefined) => void;
  onEscape?: (value: FieldPhonesValue | undefined) => void;
  onSubmit?: (value: FieldPhonesValue | undefined) => void;
  onClickOutside?: (
    value: FieldPhonesValue | undefined,
    event: MouseEvent | TouchEvent,
  ) => void;
  onError?: (hasError: boolean, values: PhoneRecord[]) => void;
};

export const PhonesMultiItemInput = ({
  value,
  fieldName,
  defaultCountry,
  maxNumberOfValues,
  variant,
  placeholder,
  onChange,
  onEnter,
  onEscape,
  onSubmit,
  onClickOutside,
  onError,
}: PhonesMultiItemInputProps) => {
  const phones = createPhonesFromFieldValue(value);
  const isInline = variant === 'inline';

  const parseArrayToPhonesValue = (phones: PhoneRecord[]) => {
    const [nextPrimaryPhone, ...nextAdditionalPhones] = phones;

    const nextValue: FieldPhonesValue = {
      primaryPhoneNumber: nextPrimaryPhone?.number ?? '',
      primaryPhoneCountryCode: nextPrimaryPhone?.countryCode ?? '',
      primaryPhoneCallingCode: nextPrimaryPhone?.callingCode ?? '',
      additionalPhones: nextAdditionalPhones,
    };
    const parseResponse = phonesFieldValueSchema.safeParse(nextValue);
    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handlePhonesChange = (updatedPhones: PhoneRecord[]) => {
    const nextValue = parseArrayToPhonesValue(updatedPhones);

    if (isDefined(nextValue)) {
      onChange(nextValue);
    }
  };

  const validateInput = (input: string) => ({
    isValid: phoneSchema.safeParse(input).success,
    errorMessage: '',
  });

  const getShowPrimaryIcon = (index: number) =>
    index === 0 && phones.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  return (
    <MultiItemFieldInput
      variant={variant}
      items={phones}
      onChange={handlePhonesChange}
      onClickOutside={(updatedPhones, event) =>
        onClickOutside?.(parseArrayToPhonesValue(updatedPhones), event)
      }
      onEscape={(updatedPhones) =>
        onEscape?.(parseArrayToPhonesValue(updatedPhones))
      }
      onEnter={(updatedPhones) =>
        onEnter?.(parseArrayToPhonesValue(updatedPhones))
      }
      onSubmit={(updatedPhones) =>
        onSubmit?.(parseArrayToPhonesValue(updatedPhones))
      }
      placeholder={t`Phone`}
      inputPlaceholder={placeholder}
      fieldMetadataType={FieldMetadataType.PHONES}
      validateInput={validateInput}
      formatInput={(input) => {
        if (input === '') {
          return {
            number: '',
            callingCode: '',
            countryCode: '',
          };
        }

        try {
          const phone = parsePhoneNumber(input);

          return {
            number: phone.nationalNumber,
            callingCode: `+${phone.countryCallingCode}`,
            countryCode: phone.country as string,
          };
        } catch {
          return {
            number: input,
            callingCode: '',
            countryCode: '',
          };
        }
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
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldName}-${index}`}
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          phone={phone}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
      )}
      renderInput={({
        value,
        onChange,
        onKeyDown,
        onFocus,
        onBlur,
        autoFocus,
        placeholder,
        hasError,
        isFramed,
      }) => {
        return (
          <StyledCustomPhoneInputContainer
            hasItem={!!phones.length && !isFramed && !isInline}
            hasError={hasError}
            data-framed={isFramed}
          >
            <StyledCustomPhoneInputWrapper data-framed={isFramed}>
              <ReactPhoneNumberInput
                autoFocus={autoFocus}
                placeholder={placeholder}
                value={value as E164Number}
                onChange={onChange as unknown as (newValue: E164Number) => void}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                international={true}
                withCountryCallingCode={true}
                countrySelectComponent={PhoneCountryPickerDropdownButton}
                defaultCountry={defaultCountry}
              />
            </StyledCustomPhoneInputWrapper>
          </StyledCustomPhoneInputContainer>
        );
      }}
      onError={onError}
      maxItemCount={maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES}
    />
  );
};
