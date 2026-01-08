import { z } from 'zod';

import {
  type FieldJsonValue,
  type Json,
} from '@/object-record/record-field/ui/types/FieldMetadata';

// See https://zod.dev/?id=json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);

export const jsonWithoutLiteralsSchema: z.ZodType<FieldJsonValue> = z.union([
  z.null(), // Exclude literal values other than null
  z.array(jsonSchema),
  z.record(z.string(), jsonSchema),
]);

export const isFieldRawJsonValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  jsonWithoutLiteralsSchema.safeParse(fieldValue).success;
