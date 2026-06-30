import { isArray, isNonEmptyArray } from '@sniptt/guards';

import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { isDefined } from 'src/utils/is-defined';
import { normalizeEnumValue } from 'src/utils/normalize-enum-value';

export const pickMultiSelect = ({
  rawValues,
  allowedValues,
  transform = normalizeEnumValue,
}: {
  rawValues: unknown;
  allowedValues: Set<string>;
  transform?: (value: string) => string | undefined;
}): string[] | undefined => {
  if (!isArray(rawValues)) {
    return undefined;
  }

  const values: string[] = [];
  const seenValues = new Set<string>();

  for (const raw of rawValues) {
    const value = pickSelect({ raw, allowedValues, transform });
    if (isDefined(value) && !seenValues.has(value)) {
      seenValues.add(value);
      values.push(value);
    }
  }

  return isNonEmptyArray(values) ? values : undefined;
};
