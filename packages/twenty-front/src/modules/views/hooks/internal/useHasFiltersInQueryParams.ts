import qs from 'qs';
import { useMemo } from 'react';
import z from 'zod';

import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  relationFilterValueSchemaObject,
} from 'twenty-shared/utils';

const urlFilterSchema = z.object({
  field: z.string(),
  op: z.enum(ViewFilterOperand),
  value: z.string(),
  subField: z.string().optional(),
});

const urlFilterGroupSchema: z.ZodType<{
  operator: string;
  filters?: z.infer<typeof urlFilterSchema>[];
  groups?: {
    operator: string;
    filters?: z.infer<typeof urlFilterSchema>[];
    groups?: unknown[];
  }[];
}> = z.lazy(() =>
  z.object({
    operator: z.string(),
    filters: z.array(urlFilterSchema).optional(),
    groups: z.array(urlFilterGroupSchema).optional(),
  }),
);

const filterQueryParamsSchema = z.object({
  filter: z
    .record(
      z.string(),
      z.partialRecord(
        z.enum(ViewFilterOperand),
        z.string().or(z.array(z.string())).or(relationFilterValueSchemaObject),
      ),
    )
    .optional(),
  filterGroup: urlFilterGroupSchema.optional(),
});

export const useHasFiltersInQueryParams = () => {
  const { searchParams } = useObjectMetadataFromRoute();

  const queryParamsValidation = filterQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const filterQueryParams = useMemo(
    () =>
      queryParamsValidation.success ? queryParamsValidation.data.filter : {},
    [queryParamsValidation],
  );

  const filterGroupQueryParams = useMemo(
    () =>
      queryParamsValidation.success
        ? queryParamsValidation.data.filterGroup
        : undefined,
    [queryParamsValidation],
  );

  const hasFiltersQueryParams =
    (isDefined(filterQueryParams) &&
      Object.entries(filterQueryParams).length > 0) ||
    isDefined(filterGroupQueryParams);

  return {
    hasFiltersQueryParams,
  };
};
