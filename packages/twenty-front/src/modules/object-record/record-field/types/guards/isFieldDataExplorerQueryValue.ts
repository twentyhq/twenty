import { FieldJsonValue } from '@/object-record/record-field/types/FieldMetadata';
import { z } from 'zod';

interface DataExplorerQueryChildJoin {
  type: 'join';
  children: DataExplorerQueryChild[];
  fieldMetadataId?: string;
  measure?: 'COUNT';
}

interface DataExplorerQueryChildSelect {
  type: 'select';
  children?: DataExplorerQueryChild[];
  fieldMetadataId?: string;
  measure?: 'AVG' | 'MAX' | 'MIN' | 'SUM';
}

const dataExplorerQueryGroupBySchema = z.object({
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

const dataExplorerQuerySortSchema = z.object({
  type: z.literal('sort'),
  sortBy: z.enum(['ASC', 'DESC']).optional(),
});

type DataExplorerQueryChild =
  | DataExplorerQueryChildJoin
  | DataExplorerQueryChildSelect
  | z.infer<typeof dataExplorerQueryGroupBySchema>
  | z.infer<typeof dataExplorerQuerySortSchema>;

const dataExplorerQueryChildSchema: z.ZodType<DataExplorerQueryChild> = z.lazy(
  () =>
    z.union([
      dataExplorerQueryChildJoinSchema,
      dataExplorerQueryChildSelectSchema,
      dataExplorerQueryGroupBySchema,
      dataExplorerQuerySortSchema,
    ]),
);

const dataExplorerQueryChildJoinSchema: z.ZodType<DataExplorerQueryChildJoin> =
  z.object({
    type: z.literal('join'),
    children: z.array(dataExplorerQueryChildSchema),
    fieldMetadataId: z.string().optional(),
    measure: z.literal('COUNT').optional(),
  });

const dataExplorerQueryChildSelectSchema: z.ZodType<DataExplorerQueryChildSelect> =
  z.object({
    type: z.literal('select'),
    children: z.array(dataExplorerQueryChildSchema).optional(),
    fieldMetadataId: z.string().optional(),
    measure: z.enum(['AVG', 'MAX', 'MIN', 'SUM']).optional(),
  });

export const dataExplorerQuerySchema = z.object({
  sourceObjectMetadataId: z.string().optional(),
  children: z.array(dataExplorerQueryChildSchema).optional(),
});

export type DataExplorerQuery = z.infer<typeof dataExplorerQuerySchema>;

export const isFieldDataExplorerQueryValue = (
  fieldValue: unknown,
): fieldValue is FieldJsonValue =>
  dataExplorerQuerySchema.safeParse(fieldValue).success;
