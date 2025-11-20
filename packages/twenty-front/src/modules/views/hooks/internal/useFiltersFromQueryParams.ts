import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import { logError } from '~/utils/logError';
import z from 'zod';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ObjectPermissions, ViewFilterOperand } from 'twenty-shared/types';
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

export type FilterQueryParams = z.infer<typeof filterQueryParamsSchema>;

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
              const fieldMetadataItem = objectMetadataItem.fields.find(
                (field) => field.name === fieldName,
              );

              if (!fieldMetadataItem) return null;

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

  return {
    getFiltersFromQueryParams,
  };
};
