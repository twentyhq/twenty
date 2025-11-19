import qs from 'qs';
import { useMemo } from 'react';
import z from 'zod';

import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { isDefined } from 'twenty-shared/utils';

const groupQueryParamsSchema = z.object({
  group: z.record(z.string(), z.string()).optional(),
});

export type GroupQueryParams = z.infer<typeof groupQueryParamsSchema>;

type ViewGroupFromQueryParams = {
  __typename: 'ViewGroup';
  id: string;
  fieldMetadataId: string;
  fieldValue: string;
  isVisible: boolean;
  position: number;
};

export const useGroupsFromQueryParams = () => {
  const { searchParams, objectMetadataItem } = useObjectMetadataFromRoute();

  const queryParamsValidation = groupQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const groupQueryParams = useMemo(
    () =>
      queryParamsValidation.success ? queryParamsValidation.data.group : {},
    [queryParamsValidation],
  );

  const hasGroupsQueryParams =
    isDefined(groupQueryParams) && Object.entries(groupQueryParams).length > 0;

  const getGroupsFromQueryParams = (): ViewGroupFromQueryParams[] => {
    if (!hasGroupsQueryParams) return [];

    return Object.entries(groupQueryParams)
      .map(([fieldName, fieldValue], index) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldMetadataItem) return null;

        return {
          __typename: 'ViewGroup' as const,
          id: `tmp-group-${fieldName}-${fieldValue}`,
          fieldMetadataId: fieldMetadataItem.id,
          fieldValue,
          isVisible: true,
          position: index,
        };
      })
      .filter(isDefined);
  };

  return {
    hasGroupsQueryParams,
    getGroupsFromQueryParams,
    objectMetadataItem,
  };
};
