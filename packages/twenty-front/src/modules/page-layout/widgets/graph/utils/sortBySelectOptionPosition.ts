import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { isDefined } from 'twenty-shared/utils';

type SortBySelectOptionPositionParams<T> = {
  items: T[];
  options: FieldMetadataItemOption[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
  getFormattedValue: (item: T) => string;
  direction: 'ASC' | 'DESC';
};

export const sortBySelectOptionPosition = <T>({
  items,
  options,
  formattedToRawLookup,
  getFormattedValue,
  direction,
}: SortBySelectOptionPositionParams<T>): T[] => {
  const optionValueToPosition = new Map<string, number>();

  for (const option of options) {
    optionValueToPosition.set(option.value, option.position);
  }

  return items.toSorted((a, b) => {
    const formattedA = getFormattedValue(a);
    const formattedB = getFormattedValue(b);

    const rawA = formattedToRawLookup.get(formattedA);
    const rawB = formattedToRawLookup.get(formattedB);

    const positionA = isDefined(rawA)
      ? (optionValueToPosition.get(String(rawA)) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;

    const positionB = isDefined(rawB)
      ? (optionValueToPosition.get(String(rawB)) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;

    return direction === 'ASC' ? positionA - positionB : positionB - positionA;
  });
};
