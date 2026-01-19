import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const sortOptionsForManualOrder = (
  options: FieldMetadataItemOption[],
  manualSortOrder: string[] | null | undefined,
): FieldMetadataItemOption[] => {
  if (!isDefined(manualSortOrder) || manualSortOrder.length === 0) {
    return [...options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  const orderMap = new Map(
    manualSortOrder.map((value, index) => [value, index]),
  );

  return [...options].sort((a, b) => {
    const indexA = orderMap.get(a.value);
    const indexB = orderMap.get(b.value);

    if (!isDefined(indexA) && !isDefined(indexB)) {
      return 0;
    }

    if (!isDefined(indexA)) {
      return 1;
    }

    if (!isDefined(indexB)) {
      return -1;
    }

    return indexA - indexB;
  });
};
