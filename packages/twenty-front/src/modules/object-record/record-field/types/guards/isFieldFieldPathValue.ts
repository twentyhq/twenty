import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

const chartQuerySchema = z
  .object({
    sourceObjectMetadataId: z.string().nullable(),
    target: z
      .object({
        relationFieldMetadataIds: z.array(z.string()).nullable(),
        measureFieldMetadataId: z.string().nullable(),
        measure: z.string().nullable(),
      })
      .partial(),
    groupBy: z
      .object({
        relationFieldMetadataIds: z.array(z.string()).nullable(),
        measureFieldMetadataId: z.string().nullable(),
        measure: z.string().nullable(),
        groups: z
          .array(
            z
              .object({ upperLimit: z.number(), lowerLimit: z.number() })
              .partial(),
          )
          .nullable(),
        includeNulls: z.boolean().nullable(),
      })
      .partial(),
    // Later: Filters should be included in the CHART_QUERY UI => better to also store them in CHART_QUERY JSON?
  })
  .partial();

export type ChartQuery = z.infer<typeof chartQuerySchema>;

const fieldPathSchema = z.array(z.string()).nullable();

export const isFieldFieldPathValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  fieldPathSchema.safeParse(fieldValue).success;
