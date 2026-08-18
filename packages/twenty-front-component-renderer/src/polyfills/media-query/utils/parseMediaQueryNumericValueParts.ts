import { isDefined } from 'twenty-shared/utils';

const MEDIA_QUERY_NUMERIC_VALUE_PATTERN = /^(\d+(?:\.\d+)?|\.\d+)([a-z]*)$/;

export const parseMediaQueryNumericValueParts = (
  valueString: string,
): { numericValue: number; unit: string } | null => {
  const valueMatch = valueString.match(MEDIA_QUERY_NUMERIC_VALUE_PATTERN);

  if (!isDefined(valueMatch)) {
    return null;
  }

  const [, numericValuePart, unit] = valueMatch;

  return { numericValue: Number(numericValuePart), unit };
};
