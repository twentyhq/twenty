import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type UseMultiItemDraftParams<TItem> = {
  items: TItem[];
  getItemText: (item: TItem) => string;
  onItemsChange: (items: TItem[]) => void;
  onItemsSubmit?: (items: TItem[]) => void;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  formatInput?: (params: { input: string; itemIndex?: number }) => TItem;
  maxItemCount?: number;
  shouldOpenInputWhenEmpty?: boolean;
  onError?: (hasError: boolean) => void;
};

export const useMultiItemDraft = <TItem>({
  items,
  getItemText,
  onItemsChange,
  onItemsSubmit,
  validateInput,
  formatInput,
  maxItemCount,
  shouldOpenInputWhenEmpty = true,
  onError,
}: UseMultiItemDraftParams<TItem>) => {
  const isSingleItemMode = maxItemCount === 1;
  const isLimitReached =
    isDefined(maxItemCount) && items.length >= maxItemCount;

  const shouldOpenInputOnMount =
    shouldOpenInputWhenEmpty && (items.length === 0 || isSingleItemMode);

  const [isInputDisplayed, setIsInputDisplayed] = useState(
    shouldOpenInputOnMount,
  );
  const [inputValue, setInputValue] = useState(
    shouldOpenInputOnMount && isNonEmptyArray(items)
      ? getItemText(items[0])
      : '',
  );
  const [editedItemIndex, setEditedItemIndex] = useState(0);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isEditingItemInPlace =
    isInputDisplayed &&
    !isAddingNewItem &&
    !isSingleItemMode &&
    editedItemIndex < items.length;

  const handleInputChange = (value: string) => {
    setInputValue(turnIntoEmptyStringIfWhitespacesOnly(value));

    if (!isDefined(validateInput)) {
      return;
    }

    setHasError(false);
    onError?.(false);
  };

  const startAdding = () => {
    if (isLimitReached || !commitEditedItem()) {
      return;
    }

    setIsAddingNewItem(true);
    setInputValue('');
    setIsInputDisplayed(true);
  };

  const startEditing = (index: number) => {
    setEditedItemIndex(index);
    setInputValue(getItemText(items[index]));
    setIsAddingNewItem(false);
    setIsInputDisplayed(true);
  };

  const closeInput = () => {
    setIsInputDisplayed(false);
    setIsAddingNewItem(false);
    setInputValue('');
  };

  const resetInputForItems = (remainingItems: TItem[]) => {
    const shouldShowInput =
      remainingItems.length === 0 && shouldOpenInputWhenEmpty;

    setIsInputDisplayed(shouldShowInput);
    setIsAddingNewItem(false);

    if (shouldShowInput) {
      setInputValue('');
    }
  };

  const commitInput = (): TItem[] | null => {
    const { sanitizedInput, isValid } = sanitizeAndValidateInput(
      inputValue,
      validateInput,
    );

    if (!isValid) {
      setHasError(true);
      onError?.(true);

      return null;
    }

    const editingIndex = isAddingNewItem ? null : editedItemIndex;

    const updatedItems = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items,
      editingIndex,
      singleItemMode: isSingleItemMode,
      formatInput,
    });

    const isItemDeletion =
      !isNonEmptyString(sanitizedInput) &&
      isDefined(editingIndex) &&
      !isSingleItemMode;

    if (isItemDeletion) {
      resetInputForItems(updatedItems);
    }

    onItemsChange(updatedItems);

    return updatedItems;
  };

  const commitEditedItem = () => {
    if (!isEditingItemInPlace) {
      return true;
    }

    const updatedItems = commitInput();

    if (!isDefined(updatedItems)) {
      return false;
    }

    if (!isDeeplyEqual(items, updatedItems)) {
      onItemsSubmit?.(updatedItems);
    }

    return true;
  };

  return {
    isInputDisplayed,
    inputValue,
    isAddingNewItem,
    editedItemIndex,
    isEditingItemInPlace,
    hasError,
    isSingleItemMode,
    isLimitReached,
    handleInputChange,
    startAdding,
    startEditing,
    closeInput,
    resetInputForItems,
    commitInput,
    commitEditedItem,
  };
};
