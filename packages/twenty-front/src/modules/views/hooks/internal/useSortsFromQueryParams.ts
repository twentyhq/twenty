import qs from 'qs';
import { useCallback, useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { sortUrlQueryParamsSchema } from '@/views/schemas/sortUrlQueryParamsSchema';
import { useParams, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { type ViewSortDirection } from '~/generated/graphql';

export const useSortsFromQueryParams = () => {
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const queryParamsValidation = sortUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const sortQueryParams = useMemo(
    () =>
      queryParamsValidation.success ? queryParamsValidation.data.sort : {},
    [queryParamsValidation],
  );

  const hasSortsQueryParams =
    isDefined(sortQueryParams) && Object.entries(sortQueryParams).length > 0;

  const getSortsFromQueryParams = useCallback((): RecordSort[] => {
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
  }, [hasSortsQueryParams, sortQueryParams, objectMetadataItem.fields]);

  return {
    hasSortsQueryParams,
    getSortsFromQueryParams,
    objectMetadataItem,
  };
};
