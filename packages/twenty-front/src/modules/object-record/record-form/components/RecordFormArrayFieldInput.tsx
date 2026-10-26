import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getRecordFormItemIndexAfterSave } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterSave';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { toSpliced } from '~/utils/array/toSpliced';

const getArrayItemText = (item: string) => item;

type RecordFormArrayFieldInputProps = {
  label?: string;
  defaultValue?: FieldArrayValue | null;
  maxNumberOfValues?: number | null;
  onChange: (value: FieldArrayValue) => void;
};

export const RecordFormArrayFieldInput = ({
  label,
  defaultValue,
  maxNumberOfValues,
  onChange,
}: RecordFormArrayFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxItemCount === 1;

  const [savedItems, setSavedItems] = useState<string[]>(
    () => defaultValue ?? [],
  );
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isInputOpen,
    editedItemIndex,
    inputValue,
    startAddingItem,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: savedItems,
    getItemText: getArrayItemText,
    isInputInitiallyOpen: isSingleItemMode || savedItems.length < maxItemCount,
    initialEditedItemIndex:
      isSingleItemMode && savedItems.length > 0 ? 0 : null,
  });

  const openNextInput = (items: string[]) => {
    if (isSingleItemMode && isNonEmptyArray(items)) {
      startEditingItem({ itemIndex: 0, currentItems: items });
      return;
    }

    if (items.length < maxItemCount) {
      startAddingItem();
      return;
    }

    closeInput();
  };

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const getItemsWithInput = (sanitizedInput: string) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: savedItems,
      editingIndex: isSingleItemMode ? 0 : editedItemIndex,
      singleItemMode: isSingleItemMode,
    });

  const saveItems = (items: string[]) => {
    setSavedItems(items);
    onChange(items);
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    onChange(getItemsWithInput(value.trim()));
  };

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedItems = getItemsWithInput(sanitizedInput);

    saveItems(updatedItems);

    return updatedItems;
  };

  const handleEnter = () => {
    const updatedItems = saveInputValue();

    if (!isDefined(updatedItems) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openNextInput(updatedItems);
    inputRef.current?.focus();
  };

  const handleEscape = () => {
    saveItems(savedItems);
    openNextInput(savedItems);
  };

  const saveInputValueBeforeRowAction = (itemIndex: number) => {
    const updatedItems = saveInputValue();

    if (!isDefined(updatedItems)) {
      return null;
    }

    const hasRemovedEditedItem = updatedItems.length < savedItems.length;

    return {
      updatedItems,
      itemIndexAfterSave: getRecordFormItemIndexAfterSave({
        itemIndex,
        removedItemIndex: hasRemovedEditedItem ? editedItemIndex : null,
      }),
    };
  };

  const handleEdit = (index: number) => {
    const saveResult = saveInputValueBeforeRowAction(index);

    if (!isDefined(saveResult)) {
      return;
    }

    setShouldFocusInput(true);
    if (isDefined(saveResult.itemIndexAfterSave)) {
      startEditingItem({
        itemIndex: saveResult.itemIndexAfterSave,
        currentItems: saveResult.updatedItems,
      });
      return;
    }

    openNextInput(saveResult.updatedItems);
  };

  const handleDelete = (index: number) => {
    const saveResult = saveInputValueBeforeRowAction(index);

    if (!isDefined(saveResult)) {
      return;
    }

    const updatedItems = isDefined(saveResult.itemIndexAfterSave)
      ? toSpliced(saveResult.updatedItems, saveResult.itemIndexAfterSave, 1)
      : saveResult.updatedItems;

    saveItems(updatedItems);
    openNextInput(updatedItems);
  };

  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedItems);
  const visibleItems = shouldShowItems ? savedItems : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing = shouldShowItems
    ? 'compact'
    : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowItems && shouldShowInputInFooter}
      rightComponent={
        isSingleItemMode ? undefined : (
          <MultiItemFieldSaveButton
            isAddingNewItem={!isDefined(editedItemIndex)}
            onClick={handleEnter}
          />
        )
      }
    >
      <MultiItemFieldTextInput
        ref={inputRef}
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={t`Enter value`}
        value={inputValue}
        onChange={handleTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <RecordFormMultiItemList
        footer={shouldShowInputInFooter ? itemInput : undefined}
      >
        {visibleItems?.map((item, index) =>
          index === editedItemIndex && isEditingItemInPlace ? (
            <MultiItemFieldEditedItem
              key={index}
              hasSeparatorBefore={index > 0}
              hasSeparatorAfter={index < savedItems.length - 1}
            >
              {itemInput}
            </MultiItemFieldEditedItem>
          ) : (
            <ArrayFieldMenuItem
              key={index}
              dropdownId={`${instanceId}-item-${index}`}
              value={item}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
            />
          ),
        )}
      </RecordFormMultiItemList>
    </FormFieldInputContainer>
  );
};
