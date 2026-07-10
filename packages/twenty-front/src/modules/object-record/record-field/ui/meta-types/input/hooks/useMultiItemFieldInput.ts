import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

type UseMultiItemFieldInputParams<T> = {
  items: T[];
  onChange: (updatedItems: T[]) => void;
  onEnter?: (updatedItems: T[]) => void;
  onError?: (hasError: boolean, values: T[]) => void;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  formatInput?: (input: string, itemIndex?: number) => T;
  getItemValueAsString: (index: number) => string;
  maxItemCount?: number;
  onAddClick?: () => void;
};

export const useMultiItemFieldInput = <T>({
  items,
  onChange,
  onEnter,
  onError,
  validateInput,
  formatInput,
  getItemValueAsString,
  maxItemCount,
  onAddClick,
}: UseMultiItemFieldInputParams<T>) => {
  const shouldAutoEnterBecauseOnlyOneItemIsAllowed = maxItemCount === 1;
  const shouldAutoEditFirstItemOnOpen =
    items.length === 0 || maxItemCount === 1;

  const [isInputDisplayed, setIsInputDisplayed] = useState(
    shouldAutoEditFirstItemOnOpen && !isDefined(onAddClick),
  );

  const [inputValue, setInputValue] = useState(
    shouldAutoEditFirstItemOnOpen && !isDefined(onAddClick)
      ? getItemValueAsString(0)
      : '',
  );

  const [itemToEditIndex, setItemToEditIndex] = useState(0);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);

  const [errorData, setErrorData] = useState({
    isValid: true,
    errorMessage: '',
  });

  const isLimitReached =
    typeof maxItemCount === 'number' && items.length >= maxItemCount;

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!validateInput) return;

    setErrorData(
      errorData.isValid ? errorData : { isValid: true, errorMessage: '' },
    );

    onError?.(false, items);
  };

  const handleAddButtonClick = () => {
    if (isLimitReached) {
      return;
    }

    if (isDefined(onAddClick)) {
      onAddClick();
      return;
    }

    setIsAddingNewItem(true);
    setInputValue('');
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    setItemToEditIndex(index);
    setInputValue(getItemValueAsString(index));
    setIsAddingNewItem(false);
    setIsInputDisplayed(true);
  };

  const showInputIfNoItemsRemain = (remainingItems: T[]) => {
    const shouldShowInput =
      remainingItems.length === 0 && !isDefined(onAddClick);
    setIsInputDisplayed(shouldShowInput);
    setIsAddingNewItem(false);
    if (shouldShowInput) {
      setInputValue('');
    }
  };

  const validateInputAndComputeUpdatedItems = (): {
    isValid: boolean;
    updatedItems: T[];
  } => {
    const { sanitizedInput, isValid, errorMessage } = sanitizeAndValidateInput(
      inputValue,
      validateInput,
    );

    if (!isValid) {
      onError?.(true, items);
      setErrorData({ isValid: false, errorMessage });
      return { isValid: false, updatedItems: items };
    }

    const editingIndex = isAddingNewItem ? null : itemToEditIndex;

    const updatedItems = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items,
      editingIndex,
      singleItemMode: shouldAutoEnterBecauseOnlyOneItemIsAllowed,
      formatInput,
    });

    const isItemDeletion =
      !isNonEmptyString(sanitizedInput) &&
      isDefined(editingIndex) &&
      !shouldAutoEnterBecauseOnlyOneItemIsAllowed;

    if (isItemDeletion) {
      showInputIfNoItemsRemain(updatedItems);
    }

    return { isValid: true, updatedItems };
  };

  const handleEnter = () => {
    const { isValid, updatedItems } = validateInputAndComputeUpdatedItems();
    if (!isValid) {
      return;
    }

    onChange(updatedItems);
    if (shouldAutoEnterBecauseOnlyOneItemIsAllowed) {
      onEnter?.(updatedItems);
    }
    setIsInputDisplayed(false);
    setIsAddingNewItem(false);
    setInputValue('');
  };

  const handleSetPrimaryItem = (index: number) => {
    const updatedItems = moveArrayItem(items, { fromIndex: index, toIndex: 0 });
    onChange(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = toSpliced(items, index, 1);
    onChange(updatedItems);
    showInputIfNoItemsRemain(updatedItems);
  };

  return {
    isInputDisplayed,
    inputValue,
    isAddingNewItem,
    errorData,
    isLimitReached,
    handleInputChange,
    handleAddButtonClick,
    handleEditButtonClick,
    handleEnter,
    handleSetPrimaryItem,
    handleDeleteItem,
    validateInputAndComputeUpdatedItems,
  };
};
