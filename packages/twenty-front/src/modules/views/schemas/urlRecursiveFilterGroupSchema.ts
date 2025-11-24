import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import z from 'zod';
import { urlSingleFilterSchema } from './urlSingleFilterSchema';

type UrlRecursiveFilterGroupSchemaType = {
  operator: RecordFilterGroupLogicalOperator;
  filters?: z.infer<typeof urlSingleFilterSchema>[];
  groups?: UrlRecursiveFilterGroupSchemaType[];
};

export const urlRecursiveFilterGroupSchema: z.ZodType<UrlRecursiveFilterGroupSchemaType> =
  z.lazy(() =>
    z.object({
      operator: z.enum(RecordFilterGroupLogicalOperator),
      filters: z.array(urlSingleFilterSchema).optional(),
      groups: z.array(urlRecursiveFilterGroupSchema).optional(),
    }),
  );
