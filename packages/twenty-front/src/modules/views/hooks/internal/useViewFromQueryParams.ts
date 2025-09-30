import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import z from 'zod';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  relationFilterValueSchemaObject,
} from 'twenty-shared/utils';

const filterQueryParamsSchema = z.object({
  viewId: z.string().optional(),
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

export const useViewFromQueryParams = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const queryParamsValidation = filterQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  const filterQueryParams = useMemo(
    () =>
      queryParamsValidation.success ? queryParamsValidation.data.filter : {},
    [queryParamsValidation],
  );
  const viewIdQueryParam = useMemo(
    () =>
      queryParamsValidation.success
        ? queryParamsValidation.data.viewId
        : undefined,
    [queryParamsValidation],
  );

  const hasFiltersQueryParams =
    isDefined(filterQueryParams) &&
    Object.entries(filterQueryParams).length > 0;

  const getFiltersFromQueryParams = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!hasFiltersQueryParams) return [];

        return (
          await Promise.all(
            Object.entries(filterQueryParams).map<Promise<ViewFilter | null>>(
              async ([fieldName, filterFromURL]) => {
                const [filterOperandFromURL, filterValueFromURL] =
                  Object.entries(filterFromURL)[0];
                const fieldMetadataItem = objectMetadataItem.fields.find(
                  (field) => field.name === fieldName,
                );

                if (!fieldMetadataItem) return null;

                const relationObjectMetadataNameSingular =
                  fieldMetadataItem.relation?.targetObjectMetadata
                    ?.nameSingular;

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

                const relationRecordNames = [];

                if (
                  isNonEmptyString(relationObjectMetadataNamePlural) &&
                  isDefined(relationObjectMetadataItem) &&
                  (Array.isArray(filterValueFromURL) ||
                    satisfiesRelationFilterSchema)
                ) {
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
                }

                const filterValueAsString =
                  Array.isArray(filterValueFromURL) ||
                  isObject(filterValueFromURL)
                    ? JSON.stringify(filterValueFromURL)
                    : filterValueFromURL;

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
                  persistAction: 'NONE',
                };
              },
            ),
          )
        ).filter(isDefined);
      },
    [
      apolloCoreClient,
      filterQueryParams,
      hasFiltersQueryParams,
      objectMetadataItem.fields,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return {
    viewIdQueryParam,
    hasFiltersQueryParams,
    getFiltersFromQueryParams,
    objectMetadataItem,
  };
};
