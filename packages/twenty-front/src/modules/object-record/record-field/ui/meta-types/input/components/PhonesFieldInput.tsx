import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePhonesField } from '@/object-record/record-field/ui/meta-types/hooks/usePhonesField';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { PhonesFieldPhoneInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldPhoneInput';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { formatPhoneInput } from '@/object-record/record-field/ui/meta-types/input/utils/formatPhoneInput';
import { getPhoneText } from '@/object-record/record-field/ui/meta-types/input/utils/getPhoneText';
import { validatePhoneInput } from '@/object-record/record-field/ui/meta-types/input/utils/validatePhoneInput';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { useContext, useRef } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

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
    validateInput: validatePhoneInput,
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
      <PhonesFieldPhoneInput
        autoFocus
        hasBorder={isNonEmptyArray(phones) && inputSpacing === 'default'}
        hasError={hasError}
        spacing={inputSpacing}
        placeholder={t`Phone`}
        value={inputValue}
        onChange={handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        defaultCountry={defaultCountry}
        shouldPreventTabNavigation
      />
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
