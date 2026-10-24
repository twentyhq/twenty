import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { phoneSchema } from '@/object-record/record-field/ui/validation-schemas/phoneSchema';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { parsePhoneNumber, type E164Number } from 'libphonenumber-js';
import { useContext, useRef } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

const StyledCustomPhoneInputContainer = styled.div<{
  hasItem: boolean;
  hasError?: boolean;
  spacing: MultiItemFieldInputSpacing;
}>`
  align-self: ${({ spacing }) => (spacing === 'compact' ? 'stretch' : 'auto')};
  background-color: ${({ hasItem }) =>
    hasItem ? themeCssVariables.background.transparent.lighter : 'transparent'};
  border: ${({ hasItem, hasError }) =>
    hasItem
      ? hasError
        ? `1px solid ${themeCssVariables.border.color.danger}`
        : `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ hasItem }) => (hasItem ? '4px' : '0')};
  flex: 1;
  height: ${({ hasItem }) => (hasItem ? '30px' : 'auto')};
  min-width: 0;
`;

const StyledCustomPhoneInputWrapper = styled.div<{
  spacing: MultiItemFieldInputSpacing;
}>`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  height: 100%;
  width: 100%;

  .PhoneInput {
    height: 100%;
  }

  .PhoneInputInput {
    background: none;
    border: none;
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    height: 100%;
    padding-left: ${({ spacing }) =>
      spacing === 'compact'
        ? themeCssVariables.spacing[1]
        : themeCssVariables.spacing[2]};

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

const EMPTY_PHONE: PhoneRecord = {
  number: '',
  callingCode: '',
  countryCode: '',
};

const getPhoneText = ({
  callingCode,
  number,
}: Pick<PhoneRecord, 'callingCode' | 'number'>) => callingCode + number;

const validatePhone = (input: string) => ({
  isValid: phoneSchema.safeParse(input).success,
  errorMessage: '',
});

const formatPhoneInput = ({ input }: { input: string }): PhoneRecord => {
  if (input === '') {
    return EMPTY_PHONE;
  }

  const phone = parsePhoneNumber(input);

  if (!isDefined(phone)) {
    return EMPTY_PHONE;
  }

  return {
    number: phone.nationalNumber,
    callingCode: `+${phone.countryCallingCode}`,
    countryCode: phone.country ?? '',
  };
};

export const PhonesFieldInput = () => {
  const { fieldDefinition, setDraftValue, draftValue } = usePhonesField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const phones = createPhonesFromFieldValue(draftValue);

  const defaultCountry = stripSimpleQuotesFromString(
    fieldDefinition?.defaultValue?.primaryPhoneCountryCode,
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

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

  const handleChange = (updatedPhones: PhoneRecord[]) => {
    const nextValue = parseArrayToPhonesValue(updatedPhones);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleSubmit = (updatedPhones: PhoneRecord[]) => {
    if (isDeeplyEqual(phones, updatedPhones)) {
      return;
    }

    onSubmit?.({
      newValue: parseArrayToPhonesValue(updatedPhones),
      skipClose: true,
    });
  };

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const isSingleItemMode = maxNumberOfValues === 1;
  const isLimitReached = phones.length >= maxNumberOfValues;

  const {
    isInputOpen,
    editedItemIndex,
    inputValue,
    hasError,
    startAddingItem,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: phones,
    getItemText: getPhoneText,
    isInputInitiallyOpen: phones.length === 0 || isSingleItemMode,
    initialEditedItemIndex: isSingleItemMode && phones.length > 0 ? 0 : null,
    validateInput: validatePhone,
    onHasErrorChange: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && phones.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: phones, getItemText: getPhoneText });

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedPhones = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: phones,
      editingIndex: editedItemIndex,
      singleItemMode: isSingleItemMode,
      formatInput: formatPhoneInput,
    });

    handleChange(updatedPhones);

    return updatedPhones;
  };

  const handleInputEnter = () => {
    const updatedPhones = saveInputValue();

    if (!isDefined(updatedPhones)) {
      return;
    }

    if (isSingleItemMode) {
      onEnter?.({ newValue: parseArrayToPhonesValue(updatedPhones) });
    } else {
      handleSubmit(updatedPhones);
    }

    closeInput();
  };

  const handleAddClick = () => {
    if (isEditingItemInPlace) {
      const updatedPhones = saveInputValue();

      if (!isDefined(updatedPhones)) {
        return;
      }

      handleSubmit(updatedPhones);
    }

    setSearchFilter('');
    startAddingItem();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseArrayToPhonesValue(phones) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedPhones = isInputOpen ? saveInputValue() : phones;

      if (!isDefined(updatedPhones)) {
        return;
      }

      onClickOutside?.({
        newValue: parseArrayToPhonesValue(updatedPhones),
        event,
      });
    },
  });

  const handleSetAsPrimary = (index: number) => {
    const updatedPhones = moveArrayItem(phones, {
      fromIndex: index,
      toIndex: 0,
    });

    if (isEditingItemInPlace) {
      closeInput();
    }

    handleChange(updatedPhones);
    handleSubmit(updatedPhones);
  };

  const handleDelete = (index: number) => {
    const updatedPhones = toSpliced(phones, index, 1);

    handleChange(updatedPhones);
    handleSubmit(updatedPhones);
    if (isNonEmptyArray(updatedPhones)) {
      closeInput();
    } else {
      startAddingItem();
    }
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) && (!isSingleItemMode || !isInputOpen);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing =
    isNonEmptyArray(phones) && !isSingleItemMode ? 'compact' : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowInputInFooter && shouldShowItems}
      rightComponent={
        isNonEmptyArray(phones) ? (
          <MultiItemFieldSaveButton
            isAddingNewItem={!isDefined(editedItemIndex)}
            onClick={handleInputEnter}
          />
        ) : undefined
      }
    >
      <StyledCustomPhoneInputContainer
        hasItem={isNonEmptyArray(phones) && inputSpacing === 'default'}
        hasError={hasError}
        spacing={inputSpacing}
      >
        <StyledCustomPhoneInputWrapper spacing={inputSpacing}>
          <ReactPhoneNumberInput
            autoFocus
            placeholder={t`Phone`}
            value={inputValue as E164Number}
            onChange={(value?: E164Number) => handleInputChange(value ?? '')}
            onKeyDown={getMultiItemInputKeyDownHandler({
              onEnter: handleInputEnter,
              onEscape: handleEscape,
              shouldPreventTabNavigation: true,
            })}
            international={true}
            withCountryCallingCode={true}
            countrySelectComponent={PhoneCountryPickerDropdownButton}
            defaultCountry={defaultCountry}
          />
        </StyledCustomPhoneInputWrapper>
      </StyledCustomPhoneInputContainer>
    </MultiItemFieldInputRow>
  );

  return (
    <MultiItemFieldList
      ref={containerRef}
      hasItems={shouldShowItems}
      shouldShowSearch={shouldShowSearch && !isInputOpen}
      searchFilter={searchFilter}
      onSearchFilterChange={setSearchFilter}
      footerInput={shouldShowInputInFooter ? itemInput : undefined}
      addButton={
        !shouldShowInputInFooter && !isLimitReached ? (
          <MultiItemFieldAddButton
            label={t`Add Phone`}
            onClick={handleAddClick}
          />
        ) : undefined
      }
    >
      {visibleItemEntries?.map(({ item: phone, index }, position, entries) =>
        index === editedItemIndex && isEditingItemInPlace ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={position > 0}
            hasSeparatorAfter={position < entries.length - 1}
          >
            {itemInput}
          </MultiItemFieldEditedItem>
        ) : (
          <PhonesFieldMenuItem
            key={index}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            showPrimaryIcon={index === 0 && phones.length > 1}
            showSetAsPrimaryButton={index > 0}
            phone={phone}
            onEdit={() => startEditingItem({ itemIndex: index })}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
            onDelete={() => handleDelete(index)}
          />
        ),
      )}
    </MultiItemFieldList>
  );
};
