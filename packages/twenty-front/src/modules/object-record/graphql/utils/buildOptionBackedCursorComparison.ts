import { isNonEmptyString } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// Option-backed filters only declare eq/neq/in/is, so the keyset comparison is
// an explicit `in` list of the options strictly past the cursor value.
export const buildOptionBackedCursorComparison = ({
  fieldName,
  fieldMetadataItem,
  cursorValue,
  shouldTakeGreaterValues,
}: {
  fieldName: string;
  fieldMetadataItem: Pick<FieldMetadataItem, 'options'>;
  cursorValue: unknown;
  shouldTakeGreaterValues: boolean;
}): RecordGqlOperationFilter | null => {
  if (!isNonEmptyString(cursorValue)) {
    return null;
  }

  const orderedOptionValues = [...(fieldMetadataItem.options ?? [])]
    .sort((optionA, optionB) => optionA.position - optionB.position)
    .map((option) => option.value);

  const cursorValueIndex = orderedOptionValues.indexOf(cursorValue);

  if (cursorValueIndex === -1) {
    return null;
  }

  const optionValuesPastCursor = shouldTakeGreaterValues
    ? orderedOptionValues.slice(cursorValueIndex + 1)
    : orderedOptionValues.slice(0, cursorValueIndex);

  if (optionValuesPastCursor.length === 0) {
    return null;
  }

  return { [fieldName]: { in: optionValuesPastCursor } };
};
