import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import z from 'zod';

import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapUrlFilterGroupToRecordFilterGroup } from '@/views/utils/deserializeFiltersFromUrl';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  isExpectedSubFieldName,
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

export const useFiltersFromQueryParams = () => {
  const { searchParams, objectMetadataItem } = useObjectMetadataFromRoute();

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

  const getFiltersFromQueryParams = useRecoilCallback(() => {
    const fetchFiltersFromQueryParams = async (): Promise<ViewFilter[]> => {
      if (!hasFiltersQueryParams) return [];

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
  }, [filterQueryParams, hasFiltersQueryParams, objectMetadataItem.fields]);

  const filterGroupQueryParams = useMemo(
    () =>
      queryParamsValidation.success
        ? queryParamsValidation.data.filterGroup
        : undefined,
    [queryParamsValidation],
  );

  const getFilterGroupsFromQueryParams = useRecoilCallback(() => {
    const fetchFilterGroupsFromQueryParams = async (): Promise<{
      recordFilters: RecordFilter[];
      recordFilterGroups: RecordFilterGroup[];
    }> => {
      if (!isDefined(filterGroupQueryParams)) {
        return { recordFilters: [], recordFilterGroups: [] };
      }

      return mapUrlFilterGroupToRecordFilterGroup({
        urlFilterGroup: filterGroupQueryParams as Parameters<
          typeof mapUrlFilterGroupToRecordFilterGroup
        >[0]['urlFilterGroup'],
        objectMetadataItem,
      });
    };

    return fetchFilterGroupsFromQueryParams;
  }, [filterGroupQueryParams, objectMetadataItem]);

  return {
    getFiltersFromQueryParams,
    getFilterGroupsFromQueryParams,
  };
};
