import qs from 'qs';
import { useSearchParams } from 'react-router-dom';

import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import { isDefined } from 'twenty-shared/utils';

export const useHasFiltersInQueryParams = () => {
  const [searchParams] = useSearchParams();

  const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const filterQueryParams = queryParamsValidation.success
    ? queryParamsValidation.data.filter
    : {};

  const filterGroupQueryParams = queryParamsValidation.success
    ? queryParamsValidation.data.filterGroup
    : undefined;

  const hasFiltersQueryParams =
    (isDefined(filterQueryParams) &&
      Object.entries(filterQueryParams).length > 0) ||
    isDefined(filterGroupQueryParams);

  return {
    hasFiltersQueryParams,
  };
};
