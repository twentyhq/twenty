import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

interface ChartQueryChildJoin {
  type: 'join';
  children: ChartQueryChild;
  fieldMetadataId?: string;
  measure?: 'COUNT';
}

interface ChartQueryChildSelect {
  type: 'select';
  children: ChartQueryChild;
  fieldMetadataId?: string;
  measure?: 'AVG' | 'MAX' | 'MIN' | 'SUM';
}

const chartQueryGroupBySchema = z.object({
  type: z.literal('groupBy'),
  groupBy: z.boolean().optional(),
  groups: z
    .array(
      z.object({
        upperLimit: z.number(),
        lowerLimit: z.number(),
      }),
    )
    .optional(),
  includeNulls: z.boolean().optional(),
});

const chartQuerySortSchema = z.object({
  type: z.literal('sort'),
  sortBy: z.enum(['ASC', 'DESC']).optional(),
});

type ChartQueryChild =
  | ChartQueryChildJoin
  | ChartQueryChildSelect
  | z.infer<typeof chartQueryGroupBySchema>
  | z.infer<typeof chartQuerySortSchema>;

const chartQueryChildSchema: z.ZodType<ChartQueryChild> = z.lazy(() =>
  z.union([
    chartQueryChildJoinSchema,
    chartQueryChildSelectSchema,
    chartQueryGroupBySchema,
    chartQuerySortSchema,
  ]),
);

const chartQueryChildJoinSchema: z.ZodType<ChartQueryChildJoin> = z.object({
  type: z.literal('join'),
  children: chartQueryChildSchema,
  fieldMetadataId: z.string().optional(),
  measure: z.literal('COUNT').optional(),
});

const chartQueryChildSelectSchema: z.ZodType<ChartQueryChildSelect> = z.object({
  type: z.literal('select'),
  children: chartQueryChildSchema,
  fieldMetadataId: z.string().optional(),
  measure: z.enum(['AVG', 'MAX', 'MIN', 'SUM']).optional(),
});

export const chartQuerySchema = z.object({
  sourceObjectMetadataId: z.string().optional(),
  children: z.array(chartQueryChildSchema),
});

export type ChartQuery = z.infer<typeof chartQuerySchema>;

const fieldPathSchema = z.array(z.string()).nullable();

export const isFieldDataExplorerQueryValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  fieldPathSchema.safeParse(fieldValue).success;
