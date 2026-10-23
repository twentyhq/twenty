import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type UseMultiItemDraftParams<TItem> = {
  items: TItem[];
  getItemText: (item: TItem) => string;
  onItemsChange: (items: TItem[]) => void;
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

  const handleInputChange = (value: string) => {
    setInputValue(turnIntoEmptyStringIfWhitespacesOnly(value));

    if (!isDefined(validateInput)) {
      return;
    }

    setHasError(false);
    onError?.(false);
  };

  const startAdding = () => {
    if (isLimitReached) {
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

  // Validates the draft and applies it to the items; null means the draft was rejected.
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

  return {
    isInputDisplayed,
    inputValue,
    isAddingNewItem,
    editedItemIndex,
    hasError,
    isSingleItemMode,
    isLimitReached,
    handleInputChange,
    startAdding,
    startEditing,
    closeInput,
    resetInputForItems,
    commitInput,
  };
};
