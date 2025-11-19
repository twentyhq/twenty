import qs from 'qs';
import { useMemo } from 'react';
import z from 'zod';

import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';

const viewIdQueryParamsSchema = z.object({
  viewId: z.string().optional(),
});

export const useViewIdFromQueryParams = () => {
  const { searchParams } = useObjectMetadataFromRoute();

  const queryParamsValidation = viewIdQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const viewIdQueryParam = useMemo(
    () =>
      queryParamsValidation.success
        ? queryParamsValidation.data.viewId
        : undefined,
    [queryParamsValidation],
  );

  return {
    viewIdQueryParam,
  };
};
