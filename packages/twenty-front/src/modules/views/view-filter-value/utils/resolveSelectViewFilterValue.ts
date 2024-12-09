import { z } from 'zod';

const selectViewFilterValueSchema = z
  .string()
  .transform((val) => (val === '' ? [] : JSON.parse(val)))
  .refine(
    (parsed) =>
      Array.isArray(parsed) && parsed.every((item) => typeof item === 'string'),
    {
      message: 'Expected an array of strings',
    },
  );

export const resolveSelectViewFilterValue = (
  viewFilterValue: string,
) => {
  return selectViewFilterValueSchema.parse(viewFilterValue);
};
