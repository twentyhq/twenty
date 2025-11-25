import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { type FormattedDimensionValue } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';

export const buildFormattedToRawLookup = (
  formattedValues: FormattedDimensionValue[],
): Map<string, RawDimensionValue> => {
  const lookup = new Map<string, RawDimensionValue>();

  formattedValues.forEach(
    ({ formattedPrimaryDimensionValue, rawPrimaryDimensionValue }) => {
      if (!lookup.has(formattedPrimaryDimensionValue)) {
        lookup.set(formattedPrimaryDimensionValue, rawPrimaryDimensionValue);
      }
    },
  );

  return lookup;
};
