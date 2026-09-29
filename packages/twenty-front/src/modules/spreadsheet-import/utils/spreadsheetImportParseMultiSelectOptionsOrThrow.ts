import { z } from 'zod';
import { parseJson } from 'twenty-shared/utils';

export const spreadsheetImportParseMultiSelectOptionsOrThrow = (
  value: unknown,
) => {
  const stringValue = z.string().parse(value);
  const parsedValue = parseJson<unknown>(stringValue);

  return Array.isArray(parsedValue)
    ? parsedValue
    : stringValue.split(',').map((item) => item.trim());
};
