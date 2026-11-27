import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { toSpliced } from '~/utils/array/toSpliced';

export function computeUpdatedMultiItemFieldItems<T>(params: {
  sanitizedInput: string;
  items: T[];
  editingIndex: number | null;
  singleItemMode: boolean;
  formatInput: (params: { input: string; itemIndex?: number }) => T;
}): T[];
export function computeUpdatedMultiItemFieldItems(params: {
  sanitizedInput: string;
  items: string[];
  editingIndex: number | null;
  singleItemMode: boolean;
  formatInput?: undefined;
}): string[];
export function computeUpdatedMultiItemFieldItems<T>({
  sanitizedInput,
  items,
  editingIndex,
  singleItemMode,
  formatInput,
}: {
  sanitizedInput: string;
  items: (T | string)[];
  editingIndex: number | null;
  singleItemMode: boolean;
  formatInput?: (params: { input: string; itemIndex?: number }) => T;
}): (T | string)[] {
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
    ? formatInput({
        input: sanitizedInput,
        itemIndex: isAdding ? undefined : editingIndex,
      })
    : sanitizedInput;

  return isAdding
    ? [...items, newItem]
    : toSpliced(items, editingIndex, 1, newItem);
}
