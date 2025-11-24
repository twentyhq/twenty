import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { filterUrlQueryParamsSchema } from '@/views/schemas/filterUrlQueryParamsSchema';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { deserializeUrlRecursiveFilterGroup } from '@/views/utils/deserializeUrlRecursiveFilterGroup';
import { useParams, useSearchParams } from 'react-router-dom';
import { type ViewFilterOperand } from 'twenty-shared/types';
import { isDefined, isExpectedSubFieldName } from 'twenty-shared/utils';

export const useFiltersFromQueryParams = () => {
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const queryParamsValidation = filterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const getFiltersFromQueryParams = useRecoilCallback(() => {
    const fetchFiltersFromQueryParams = async (): Promise<ViewFilter[]> => {
      if (!queryParamsValidation.success) return [];

      const filterQueryParams = queryParamsValidation.data.filter;

      if (
        !isDefined(filterQueryParams) ||
        Object.entries(filterQueryParams).length === 0
      ) {
        return [];
      }

      const promises: Promise<ViewFilter | null>[] = [];

      for (const [fieldName, filterFromURL] of Object.entries(
        filterQueryParams,
      )) {
        for (const [filterOperandFromURL, filterValueFromURL] of Object.entries(
          filterFromURL,
        )) {
          const promise = (async (): Promise<ViewFilter | null> => {
            // Split field name to handle subfields (e.g., "name.firstName" -> "name" + "firstName")
            const fieldParts = fieldName.split('.');
            const baseFieldName = fieldParts[0];
            const subFieldName =
              fieldParts.length > 1 ? fieldParts.slice(1).join('.') : undefined;

            const fieldMetadataItem = objectMetadataItem.fields.find(
              (field) => field.name === baseFieldName,
            );

            if (!fieldMetadataItem) return null;

            if (isDefined(subFieldName) && isNonEmptyString(subFieldName)) {
              if (!isCompositeFieldType(fieldMetadataItem.type)) {
                return null;
              }

              if (
                !isExpectedSubFieldName(
                  fieldMetadataItem.type as Parameters<
                    typeof isExpectedSubFieldName
                  >[0],
                  subFieldName as Parameters<typeof isExpectedSubFieldName>[1],
                  subFieldName,
                )
              ) {
                return null;
              }
            }

            const filterValueAsString =
              Array.isArray(filterValueFromURL) || isObject(filterValueFromURL)
                ? JSON.stringify(filterValueFromURL)
                : (filterValueFromURL as string);

            const displayValue = filterValueAsString;

            return {
              __typename: 'ViewFilter',
              id: `tmp-${[
                fieldName,
                filterOperandFromURL,
                filterValueFromURL,
              ].join('-')}`,
              fieldMetadataId: fieldMetadataItem.id,
              operand: filterOperandFromURL as ViewFilterOperand,
              value: filterValueAsString,
              displayValue,
              subFieldName: subFieldName
                ? (subFieldName as ViewFilter['subFieldName'])
                : undefined,
            };
          })();

          promises.push(promise);
        }
      }

      return (await Promise.all(promises)).filter(isDefined);
    };

    return fetchFiltersFromQueryParams;
  }, [queryParamsValidation, objectMetadataItem.fields]);

  const filterGroupQueryParams = queryParamsValidation.success
    ? queryParamsValidation.data.filterGroup
    : undefined;

  const getFilterGroupsFromQueryParams = useRecoilCallback(() => {
    const fetchFilterGroupsFromQueryParams = async (): Promise<{
      recordFilters: RecordFilter[];
      recordFilterGroups: RecordFilterGroup[];
    }> => {
      if (!isDefined(filterGroupQueryParams)) {
        return { recordFilters: [], recordFilterGroups: [] };
      }

      return deserializeUrlRecursiveFilterGroup({
        urlRecursiveFilterGroup: filterGroupQueryParams as Parameters<
          typeof deserializeUrlRecursiveFilterGroup
        >[0]['urlRecursiveFilterGroup'],
        objectMetadataItem,
        positionInParent: 0,
      });
    };

    return fetchFilterGroupsFromQueryParams;
  }, [filterGroupQueryParams, objectMetadataItem]);

  return {
    getFiltersFromQueryParams,
    getFilterGroupsFromQueryParams,
  };
};
