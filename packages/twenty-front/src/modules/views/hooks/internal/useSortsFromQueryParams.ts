import qs from 'qs';
import { useCallback, useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { sortUrlQueryParamsSchema } from '@/views/schemas/sortUrlQueryParamsSchema';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { type ViewSortDirection } from '~/generated-metadata/graphql';

export const useSortsFromQueryParams = () => {
  const [searchParams] = useSearchParams();
  const { objectNameSingular } = useRecordIndexContextOrThrow();
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
