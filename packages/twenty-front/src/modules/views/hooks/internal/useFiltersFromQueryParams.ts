import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import z from 'zod';
import { logError } from '~/utils/logError';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { mapUrlFilterGroupToRecordFilterGroup } from '@/views/utils/deserializeFiltersFromUrl';
import { type ObjectPermissions, ViewFilterOperand } from 'twenty-shared/types';
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
  const apolloCoreClient = useApolloCoreClient();
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

  const getFiltersFromQueryParams = useRecoilCallback(
    ({ snapshot }) => {
      const fetchFiltersFromQueryParams = async (): Promise<ViewFilter[]> => {
        if (!hasFiltersQueryParams) return [];

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const currentUserWorkspace = snapshot
          .getLoadable(currentUserWorkspaceState)
          .getValue();

        const objectsPermissions = currentUserWorkspace?.objectsPermissions;

        const objectPermissionsByObjectMetadataId =
          objectsPermissions?.reduce(
            (
              accumulator: Record<
                string,
                ObjectPermissions & { objectMetadataId: string }
              >,
              objectPermission,
            ) => {
              accumulator[objectPermission.objectMetadataId] = objectPermission;
              return accumulator;
            },
            {},
          ) ?? {};

        const promises: Promise<ViewFilter | null>[] = [];

        for (const [fieldName, filterFromURL] of Object.entries(
          filterQueryParams,
        )) {
          for (const [
            filterOperandFromURL,
            filterValueFromURL,
          ] of Object.entries(filterFromURL)) {
            const promise = (async (): Promise<ViewFilter | null> => {
              // Split field name to handle subfields (e.g., "name.firstName" -> "name" + "firstName")
              const fieldParts = fieldName.split('.');
              const baseFieldName = fieldParts[0];
              const subFieldName =
                fieldParts.length > 1
                  ? fieldParts.slice(1).join('.')
                  : undefined;

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
                    subFieldName as Parameters<
                      typeof isExpectedSubFieldName
                    >[1],
                    subFieldName,
                  )
                ) {
                  return null;
                }
              }

              const relationObjectMetadataNameSingular =
                fieldMetadataItem.relation?.targetObjectMetadata?.nameSingular;

              const relationObjectMetadataNamePlural =
                fieldMetadataItem.relation?.targetObjectMetadata?.namePlural;

              const relationObjectMetadataItem =
                relationObjectMetadataNameSingular
                  ? snapshot
                      .getLoadable(
                        objectMetadataItemFamilySelector({
                          objectName: relationObjectMetadataNameSingular,
                          objectNameType: 'singular',
                        }),
                      )
                      .getValue()
                  : null;

              const satisfiesRelationFilterSchema =
                relationFilterValueSchemaObject.safeParse(
                  filterValueFromURL,
                )?.success;

              const relationRecordNames: string[] = [];

              if (
                isNonEmptyString(relationObjectMetadataNamePlural) &&
                isDefined(relationObjectMetadataItem) &&
                (Array.isArray(filterValueFromURL) ||
                  satisfiesRelationFilterSchema)
              ) {
                try {
                  const queryResult = await apolloCoreClient.query<
                    Record<string, { edges: { node: ObjectRecord }[] }>
                  >({
                    query: generateFindManyRecordsQuery({
                      objectMetadataItem: relationObjectMetadataItem,
                      objectMetadataItems,
                      objectPermissionsByObjectMetadataId,
                    }),
                    variables: {
                      filter: {
                        id: {
                          in: satisfiesRelationFilterSchema
                            ? (
                                filterValueFromURL as {
                                  selectedRecordIds: string[];
                                }
                              )?.selectedRecordIds
                            : filterValueFromURL,
                        },
                      },
                    },
                  });

                  const relationRecordNamesFromQuery = queryResult.data?.[
                    relationObjectMetadataNamePlural
                  ]?.edges.map(
                    ({ node: record }) =>
                      getObjectRecordIdentifier({
                        objectMetadataItem: relationObjectMetadataItem,
                        record,
                      }).name,
                  );

                  relationRecordNames.push(...relationRecordNamesFromQuery);
                } catch (error) {
                  logError(
                    `useFiltersFromQueryParams: Failed to fetch relation records for filter - ${error}`,
                  );
                }
              }

              const filterValueAsString =
                Array.isArray(filterValueFromURL) ||
                isObject(filterValueFromURL)
                  ? JSON.stringify(filterValueFromURL)
                  : (filterValueFromURL as string);

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
                displayValue:
                  relationRecordNames?.join(', ') ?? filterValueAsString,
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
    },
    [
      apolloCoreClient,
      filterQueryParams,
      hasFiltersQueryParams,
      objectMetadataItem.fields,
    ],
  );

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
