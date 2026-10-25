import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export const useMultiItemInput = <TItem>({
  items,
  getItemText,
  isInputInitiallyOpen,
  initialEditedItemIndex = null,
  validateInput,
  onHasErrorChange,
}: {
  items: TItem[];
  getItemText: (item: TItem) => string;
  isInputInitiallyOpen: boolean;
  initialEditedItemIndex?: number | null;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  onHasErrorChange?: (hasError: boolean) => void;
}) => {
  const [isInputOpen, setIsInputOpen] = useState(isInputInitiallyOpen);
  const [editedItemIndex, setEditedItemIndex] = useState<number | null>(
    isInputInitiallyOpen ? initialEditedItemIndex : null,
  );
  const [inputValue, setInputValue] = useState(() =>
    isInputInitiallyOpen && isDefined(initialEditedItemIndex)
      ? getItemText(items[initialEditedItemIndex])
      : '',
  );
  const [hasError, setHasError] = useState(false);

  const updateHasError = (nextHasError: boolean) => {
    setHasError(nextHasError);
    onHasErrorChange?.(nextHasError);
  };

  const clearError = () => {
    if (hasError) {
      updateHasError(false);
    }
  };

  const startAddingItem = () => {
    setIsInputOpen(true);
    setEditedItemIndex(null);
    setInputValue('');
    clearError();
  };

  const startEditingItem = ({
    itemIndex,
    currentItems = items,
  }: {
    itemIndex: number;
    currentItems?: TItem[];
  }) => {
    setIsInputOpen(true);
    setEditedItemIndex(itemIndex);
    setInputValue(getItemText(currentItems[itemIndex]));
    clearError();
  };

  const closeInput = () => {
    setIsInputOpen(false);
    setEditedItemIndex(null);
    setInputValue('');
    clearError();
  };

  const handleInputChange = (value: string) => {
    setInputValue(turnIntoEmptyStringIfWhitespacesOnly(value));

    if (isDefined(validateInput)) {
      updateHasError(false);
    }
  };

  const validateInputValue = (): string | null => {
    const { sanitizedInput, isValid } = sanitizeAndValidateInput(
      inputValue,
      validateInput,
    );

    if (!isValid) {
      updateHasError(true);

      return null;
    }

    return sanitizedInput;
  };

  return {
    isInputOpen,
    editedItemIndex,
    inputValue,
    hasError,
    startAddingItem,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  };
};
