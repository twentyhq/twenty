import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { phoneSchema } from '@/object-record/record-field/ui/validation-schemas/phoneSchema';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { parsePhoneNumber, type E164Number } from 'libphonenumber-js';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { MultiItemFieldInput } from './MultiItemFieldInput';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { phonesSchema } from '@/object-record/record-field/ui/types/guards/isFieldPhonesValue';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { css } from '@emotion/react';
import { useContext } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

const StyledCustomPhoneInputContainer = styled.div<{
  hasItem: boolean;
  hasError?: boolean;
}>`
  ${({ hasItem, theme }) =>
    hasItem &&
    css`
      background-color: ${theme.background.transparent.lighter};
      border-radius: 4px;
      border: 1px solid ${theme.border.color.medium};
      height: 30px;
    `}

  ${({ hasError, hasItem, theme }) =>
    hasError &&
    hasItem &&
    css`
      border: 1px solid ${theme.border.color.danger};
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

export const PhonesFieldInput = () => {
  const { getLatestDraftValue, fieldDefinition, setDraftValue, draftValue } =
    usePhonesField();

  const { onEscape, onClickOutside } = useContext(FieldInputEventContext);

  const phones = createPhonesFromFieldValue(draftValue);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const defaultCountry = stripSimpleQuotesFromString(
    fieldDefinition?.defaultValue?.primaryPhoneCountryCode,
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const handlePhonesChange = (
    updatedPhones: {
      number: string;
      countryCode: string;
      callingCode: string;
    }[],
  ) => {
    const [nextPrimaryPhone, ...nextAdditionalPhones] = updatedPhones;

    const newValue = {
      primaryPhoneNumber: nextPrimaryPhone?.number ?? '',
      primaryPhoneCountryCode: nextPrimaryPhone?.countryCode ?? '',
      primaryPhoneCallingCode: nextPrimaryPhone?.callingCode ?? '',
      additionalPhones: nextAdditionalPhones,
    };

    const newValidatedPhoneResponse = phonesSchema.safeParse(newValue);

    if (newValidatedPhoneResponse.success) {
      setDraftValue(newValidatedPhoneResponse.data);
    }
  };

  const validateInput = (input: string) => ({
    isValid: phoneSchema.safeParse(input).success,
    errorMessage: '',
  });

  const getShowPrimaryIcon = (index: number) =>
    index === 0 && phones.length > 1;
  const getShowSetAsPrimaryButton = (index: number) => index > 0;

  const setIsFieldInError = useSetRecoilComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const handleError = (hasError: boolean, values: any[]) => {
    setIsFieldInError(hasError && values.length === 0);
  };

  const handleClickOutside = (
    _newValue: any,
    event: MouseEvent | TouchEvent,
  ) => {
    const latestDraftValue = getLatestDraftValue(instanceId);
    onClickOutside?.({ newValue: latestDraftValue, event });
  };

  const handleEscape = (_newValue: any) => {
    onEscape?.({ newValue: draftValue });
  };

  return (
    <MultiItemFieldInput
      items={phones}
      onChange={handlePhonesChange}
      onClickOutside={handleClickOutside}
      onEscape={handleEscape}
      placeholder="Phone"
      fieldMetadataType={FieldMetadataType.PHONES}
      validateInput={validateInput}
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
          showPrimaryIcon={getShowPrimaryIcon(index)}
          showSetAsPrimaryButton={getShowSetAsPrimaryButton(index)}
          phone={phone}
          onEdit={handleEdit}
          onSetAsPrimary={handleSetPrimary}
          onDelete={handleDelete}
        />
      )}
      renderInput={({ value, onChange, autoFocus, placeholder, hasError }) => {
        return (
          <StyledCustomPhoneInputContainer
            hasItem={!!phones.length}
            hasError={hasError}
          >
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
      onError={handleError}
      maxItemCount={maxNumberOfValues}
    />
  );
};
