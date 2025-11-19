import qs from 'qs';
import { useMemo } from 'react';
import z from 'zod';

import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { ViewSortDirection } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

const sortQueryParamsSchema = z.object({
  sort: z
    .record(z.string(), z.enum([ViewSortDirection.ASC, ViewSortDirection.DESC]))
    .optional(),
});

export type SortQueryParams = z.infer<typeof sortQueryParamsSchema>;

export const useSortsFromQueryParams = () => {
  const { searchParams, objectMetadataItem } = useObjectMetadataFromRoute();

  const queryParamsValidation = sortQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const sortQueryParams = useMemo(
    () =>
      queryParamsValidation.success ? queryParamsValidation.data.sort : {},
    [queryParamsValidation],
  );

  const hasSortsQueryParams =
    isDefined(sortQueryParams) && Object.entries(sortQueryParams).length > 0;

  const getSortsFromQueryParams = (): RecordSort[] => {
    if (!hasSortsQueryParams) return [];

    return Object.entries(sortQueryParams)
      .map(([fieldName, direction]) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldMetadataItem) return null;

        return {
          id: `tmp-sort-${fieldName}`,
          fieldMetadataId: fieldMetadataItem.id,
          direction: direction as ViewSortDirection,
        };
      })
      .filter(isDefined);
  };

  return {
    hasSortsQueryParams,
    getSortsFromQueryParams,
    objectMetadataItem,
  };
};
