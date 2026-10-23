import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { phoneSchema } from '@/object-record/record-field/ui/validation-schemas/phoneSchema';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
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
  flex: 1;
  height: ${({ hasItem }) => (hasItem ? '30px' : 'auto')};
  min-width: 0;

  &[data-in-row='true'] {
    align-self: stretch;
    height: auto;
  }

  &[data-in-row='true'] button {
    border-inline-end: none;
    border-radius: ${themeCssVariables.border.radius.sm};
    padding-inline: ${themeCssVariables.spacing[1]};
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
  width: 100%;

  &[data-in-row='true'] .PhoneInputInput {
    padding-left: ${themeCssVariables.spacing[1]};
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
    onSubmit?.({
      newValue: parseArrayToPhonesValue(updatedPhones),
      skipClose: true,
    });
  };

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const draft = useMultiItemDraft({
    items: phones,
    onItemsChange: handleChange,
    getItemText: getPhoneText,
    validateInput: validatePhone,
    formatInput: formatPhoneInput,
    maxItemCount: maxNumberOfValues,
    onError: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && phones.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: phones, getItemText: getPhoneText });

  const handleInputEnter = () => {
    const updatedItems = draft.commitInput();

    if (!isDefined(updatedItems)) {
      return;
    }

    if (draft.isSingleItemMode) {
      onEnter?.({ newValue: parseArrayToPhonesValue(updatedItems) });
    } else if (!isDeeplyEqual(phones, updatedItems)) {
      handleSubmit(updatedItems);
    }

    draft.closeInput();
  };

  const handleAddClick = () => {
    if (draft.isLimitReached) {
      return;
    }

    if (draft.isEditingItemInPlace) {
      const updatedItems = draft.commitInput();

      if (!isDefined(updatedItems)) {
        return;
      }

      if (!isDeeplyEqual(phones, updatedItems)) {
        handleSubmit(updatedItems);
      }
    }

    draft.startAdding();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseArrayToPhonesValue(phones) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedItems = draft.isInputDisplayed
        ? draft.commitInput()
        : phones;

      if (!isDefined(updatedItems)) {
        return;
      }

      onClickOutside?.({
        newValue: parseArrayToPhonesValue(updatedItems),
        event,
      });
    },
  });

  const handleSetAsPrimary = (index: number) => {
    const updatedPhones = moveArrayItem(phones, {
      fromIndex: index,
      toIndex: 0,
    });

    handleChange(updatedPhones);
    handleSubmit(updatedPhones);
  };

  const handleDelete = (index: number) => {
    const updatedPhones = toSpliced(phones, index, 1);

    handleChange(updatedPhones);
    handleSubmit(updatedPhones);
    draft.resetInputForItems(updatedPhones);
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!draft.isSingleItemMode || !draft.isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const visibleItemCount = visibleItemEntries?.length ?? 0;
  const shouldShowInputInFooter =
    draft.isInputDisplayed && !draft.isEditingItemInPlace;
  const shouldShowAddButton = !shouldShowInputInFooter && !draft.isLimitReached;
  const isInputInRow = isNonEmptyArray(phones) && !draft.isSingleItemMode;

  const itemInput = (
    <MultiItemFieldInputRow
      isInRow={isInputInRow}
      isInFooter={shouldShowInputInFooter}
      rightComponent={
        isNonEmptyArray(phones) ? (
          <MultiItemFieldSaveButton
            isAddingNewItem={draft.isAddingNewItem}
            onClick={handleInputEnter}
          />
        ) : undefined
      }
    >
      <StyledCustomPhoneInputContainer
        hasItem={isNonEmptyArray(phones) && !isInputInRow}
        hasError={draft.hasError}
        data-in-row={isInputInRow}
      >
        <StyledCustomPhoneInputWrapper data-in-row={isInputInRow}>
          <ReactPhoneNumberInput
            autoFocus
            placeholder={t`Phone`}
            value={draft.inputValue as E164Number}
            onChange={(value?: E164Number) =>
              draft.handleInputChange(value ?? '')
            }
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
    <OverlayMenuList
      ref={containerRef}
      header={
        shouldShowSearch && !draft.isInputDisplayed ? (
          <MultiItemFieldSearchHeader
            value={searchFilter}
            onChange={setSearchFilter}
          />
        ) : undefined
      }
      footer={
        <>
          {shouldShowItems &&
            (shouldShowInputInFooter || shouldShowAddButton) && (
              <OverlayMenuListSeparator />
            )}
          {shouldShowInputInFooter && itemInput}
          {shouldShowAddButton && (
            <MultiItemFieldAddButton
              label={t`Add Phone`}
              onClick={handleAddClick}
            />
          )}
        </>
      }
    >
      {visibleItemEntries?.map(({ item: phone, index }, position) =>
        draft.isEditingItemInPlace && index === draft.editedItemIndex ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={position > 0}
            hasSeparatorAfter={position < visibleItemCount - 1}
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
            onEdit={() => draft.startEditing(index)}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
            onDelete={() => handleDelete(index)}
          />
        ),
      )}
    </OverlayMenuList>
  );
};
