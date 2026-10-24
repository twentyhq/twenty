import { type MultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemInputTarget';
import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export const useMultiItemInput = <TItem>({
  items,
  getItemText,
  initialInputTarget,
  validateInput,
  onHasErrorChange,
}: {
  items: TItem[];
  getItemText: (item: TItem) => string;
  initialInputTarget: MultiItemInputTarget;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  onHasErrorChange?: (hasError: boolean) => void;
}) => {
  const getInputTextForTarget = ({
    inputTarget,
    targetItems,
  }: {
    inputTarget: MultiItemInputTarget;
    targetItems: TItem[];
  }) =>
    inputTarget.type === 'existing-item'
      ? getItemText(targetItems[inputTarget.itemIndex])
      : '';

  const [inputTarget, setInputTarget] = useState(initialInputTarget);
  const [inputValue, setInputValue] = useState(() =>
    getInputTextForTarget({
      inputTarget: initialInputTarget,
      targetItems: items,
    }),
  );
  const [hasError, setHasError] = useState(false);

  const updateHasError = (nextHasError: boolean) => {
    setHasError(nextHasError);
    onHasErrorChange?.(nextHasError);
  };

  const openInput = ({
    inputTarget: nextInputTarget,
    currentItems = items,
  }: {
    inputTarget: MultiItemInputTarget;
    currentItems?: TItem[];
  }) => {
    setInputTarget(nextInputTarget);
    setInputValue(
      getInputTextForTarget({
        inputTarget: nextInputTarget,
        targetItems: currentItems,
      }),
    );

    if (hasError) {
      updateHasError(false);
    }
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
    inputTarget,
    inputValue,
    hasError,
    openInput,
    handleInputChange,
    validateInputValue,
  };
};
