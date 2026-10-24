import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getInitialMultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/utils/getInitialMultiItemInputTarget';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';
import { t } from '@lingui/core/macro';
import { useContext, useMemo, useRef } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getArrayItemText = (item: string) => item;

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );

  const parseStringArrayToArrayValue = (arrayItems: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(arrayItems);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedItems: string[]) => {
    const nextValue = parseStringArrayToArrayValue(updatedItems);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleSubmit = (updatedItems: string[]) => {
    if (isDeeplyEqual(arrayItems, updatedItems)) {
      return;
    }

    onSubmit?.({
      newValue: parseStringArrayToArrayValue(updatedItems),
      skipClose: true,
    });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxNumberOfValues === 1;
  const isLimitReached = arrayItems.length >= maxNumberOfValues;

  const {
    inputTarget,
    inputValue,
    hasError,
    openInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: arrayItems,
    getItemText: getArrayItemText,
    initialInputTarget: getInitialMultiItemInputTarget({
      itemCount: arrayItems.length,
      isSingleItemMode,
    }),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: arrayItems, getItemText: getArrayItemText });

  const isInputDisplayed = inputTarget.type !== 'closed';
  const editedItemIndex =
    inputTarget.type === 'existing-item' ? inputTarget.itemIndex : null;
  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const closeInput = () => openInput({ type: 'closed' });

  const commitInput = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedItems = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: arrayItems,
      editingIndex: editedItemIndex,
      singleItemMode: isSingleItemMode,
    });

    handleChange(updatedItems);

    return updatedItems;
  };

  const handleInputEnter = () => {
    const updatedItems = commitInput();

    if (!isDefined(updatedItems)) {
      return;
    }

    if (isSingleItemMode) {
      onEnter?.({ newValue: parseStringArrayToArrayValue(updatedItems) });
    } else {
      handleSubmit(updatedItems);
    }

    closeInput();
  };

  const handleAddClick = () => {
    if (isEditingItemInPlace) {
      const updatedItems = commitInput();

      if (!isDefined(updatedItems)) {
        return;
      }

      handleSubmit(updatedItems);
    }

    setSearchFilter('');
    openInput({ type: 'new-item' });
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseStringArrayToArrayValue(arrayItems) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedItems = isInputDisplayed ? commitInput() : arrayItems;

      if (!isDefined(updatedItems)) {
        return;
      }

      onClickOutside?.({
        newValue: parseStringArrayToArrayValue(updatedItems),
        event,
      });
    },
  });

  const handleDelete = (index: number) => {
    const updatedItems = toSpliced(arrayItems, index, 1);

    handleChange(updatedItems);
    handleSubmit(updatedItems);
    openInput(
      isNonEmptyArray(updatedItems) ? { type: 'closed' } : { type: 'new-item' },
    );
  };

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!isSingleItemMode || !isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowInputInFooter = isInputDisplayed && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing =
    isNonEmptyArray(arrayItems) && !isSingleItemMode ? 'compact' : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowInputInFooter && shouldShowItems}
      rightComponent={
        isNonEmptyArray(arrayItems) ? (
          <MultiItemFieldSaveButton
            isAddingNewItem={inputTarget.type === 'new-item'}
            onClick={handleInputEnter}
          />
        ) : undefined
      }
    >
      <MultiItemFieldTextInput
        autoFocus
        spacing={inputSpacing}
        placeholder={t`Enter value`}
        value={inputValue}
        hasError={hasError}
        onChange={handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        shouldPreventTabNavigation
      />
    </MultiItemFieldInputRow>
  );

  return (
    <MultiItemFieldList
      ref={containerRef}
      hasItems={shouldShowItems}
      shouldShowSearch={shouldShowSearch && !isInputDisplayed}
      searchFilter={searchFilter}
      onSearchFilterChange={setSearchFilter}
      footerInput={shouldShowInputInFooter ? itemInput : undefined}
      addButton={
        !shouldShowInputInFooter && !isLimitReached ? (
          <MultiItemFieldAddButton
            label={t`Add Item`}
            onClick={handleAddClick}
          />
        ) : undefined
      }
    >
      {visibleItemEntries?.map(({ item, index }, position, entries) =>
        index === editedItemIndex && isEditingItemInPlace ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={position > 0}
            hasSeparatorAfter={position < entries.length - 1}
          >
            {itemInput}
          </MultiItemFieldEditedItem>
        ) : (
          <ArrayFieldMenuItem
            key={index}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            value={item}
            onEdit={() =>
              openInput({ type: 'existing-item', itemIndex: index })
            }
            onDelete={() => handleDelete(index)}
          />
        ),
      )}
    </MultiItemFieldList>
  );
};
