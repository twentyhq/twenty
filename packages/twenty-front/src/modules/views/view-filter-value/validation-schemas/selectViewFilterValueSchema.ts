import { isValidVariable } from 'twenty-shared/utils';
import { z } from 'zod';
export const selectViewFilterValueSchema = z
  .string()
  .transform((val) => {
    if (val === '') return [];
    if (isValidVariable(val) as boolean) {
      return [val];
    }
    return JSON.parse(val);
  })
  .refine(
    (parsed) =>
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === 'string' && isValidVariable(item)),
    {
      message: 'Expected an array of strings or variables in format {{ ... }}',
    },
  );
