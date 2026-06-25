import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { toSpliced } from '~/utils/array/toSpliced';

export const computeUpdatedMultiItemFieldItems = <T>({
  sanitizedInput,
  items,
  editingIndex,
  singleItemMode,
  formatInput,
}: {
  sanitizedInput: string;
  items: T[];
  editingIndex: number | null;
  singleItemMode: boolean;
  formatInput?: (input: string, itemIndex?: number) => T;
}): T[] => {
  const isAdding = !isDefined(editingIndex);

  if (!isNonEmptyString(sanitizedInput)) {
    if (isAdding) {
      return items;
    }
    if (singleItemMode) {
      return [];
    }
    return toSpliced(items, editingIndex, 1);
  }

  const newItem = isDefined(formatInput)
    ? formatInput(sanitizedInput, isAdding ? undefined : editingIndex)
    : (sanitizedInput as unknown as T);

  return isAdding
    ? [...items, newItem]
    : toSpliced(items, editingIndex, 1, newItem);
};
