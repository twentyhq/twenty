import { z } from 'zod';

export const OrderByDirectionEnum = z.enum([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);

export const ObjectRecordOrderByItemSchema = z
  .object({})
  .catchall(OrderByDirectionEnum)
  .refine((obj) => Object.keys(obj).length === 1, {
    message: 'Each orderBy item must specify exactly one field',
  })
  .describe(
    'Object with exactly ONE property: field name as key, OrderByDirection as value. Example: {"employees": "DescNullsLast"}',
  );

export const ObjectRecordOrderBySchema = z
  .array(ObjectRecordOrderByItemSchema)
  .optional()
  .describe(
    'Array of sort criteria. Each item sorts by one field. Use "DescNullsLast" for descending (top/largest), "AscNullsFirst" for ascending (bottom/smallest). Example: [{"employees": "DescNullsLast"}]',
  );
