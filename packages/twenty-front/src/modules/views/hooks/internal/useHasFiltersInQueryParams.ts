import qs from 'qs';
import { useMemo } from 'react';
import z from 'zod';

import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  relationFilterValueSchemaObject,
} from 'twenty-shared/utils';

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

  const hasFiltersQueryParams =
    isDefined(filterQueryParams) &&
    Object.entries(filterQueryParams).length > 0;

  return {
    hasFiltersQueryParams,
  };
};
