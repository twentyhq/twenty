import { ViewFilter } from '@/views/types/ViewFilter';
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
  viewFilter: Pick<ViewFilter, 'value'>,
) => {
  return selectViewFilterValueSchema.parse(viewFilter.value);
};
