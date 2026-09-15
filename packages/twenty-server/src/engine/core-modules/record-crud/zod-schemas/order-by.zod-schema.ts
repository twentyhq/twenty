import { z } from 'zod';

export const OrderByDirectionEnum = z.enum([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);
export const OrderByFieldValueSchema = z.union([
  OrderByDirectionEnum,
  z.record(z.string(), OrderByDirectionEnum),
]);

export const ObjectRecordOrderByItemSchema = z
  .object({})
  .catchall(OrderByFieldValueSchema)
  .refine((obj) => Object.keys(obj).length === 1, {
    message: 'Each orderBy item must specify exactly one field',
  })
  .describe(
    'Object with exactly ONE property. ' +
      'For scalar fields use a direction string: {"employees": "DescNullsLast"}. ' +
      'For composite fields (e.g. name, address, currency) use a nested object with the sub-field: {"name": {"firstName": "AscNullsFirst"}}. ' +
      'Never use dot-notation keys like "name.firstName".',
  );

export const ObjectRecordOrderBySchema = z
  .array(ObjectRecordOrderByItemSchema)
  .optional()
  .describe(
    'Array of sort criteria. Each item sorts by one field. ' +
      'Scalar fields: [{"employees": "DescNullsLast"}]. ' +
      'Composite fields (name, address, currency, …): [{"name": {"firstName": "AscNullsFirst"}}]. ' +
      'Use "DescNullsLast" for descending (top/largest), "AscNullsFirst" for ascending (bottom/smallest). ' +
      'Never use dot-notation keys like "name.firstName".',
  );
