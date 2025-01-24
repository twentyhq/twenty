import { useApolloClient } from '@apollo/client';
import { isNonEmptyString, isObject } from '@sniptt/guards';
import qs from 'qs';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import z from 'zod';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { relationFilterValueSchemaObject } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const filterQueryParamsSchema = z.object({
  viewId: z.string().optional(),
  filter: z
    .record(
      z.record(
        z.nativeEnum(ViewFilterOperand),
        z.string().or(z.array(z.string())).or(relationFilterValueSchemaObject),
      ),
    )
    .optional(),
});

export type FilterQueryParams = z.infer<typeof filterQueryParamsSchema>;

export const useViewFromQueryParams = () => {
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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

                const filterDefinition =
                  formatFieldMetadataItemAsFilterDefinition({
                    field: fieldMetadataItem,
                  });

                if (isUndefinedOrNull(filterDefinition)) return null;

                const relationObjectMetadataNameSingular =
                  fieldMetadataItem.relationDefinition?.targetObjectMetadata
                    ?.nameSingular;

                const relationObjectMetadataNamePlural =
                  fieldMetadataItem.relationDefinition?.targetObjectMetadata
                    ?.namePlural;

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
                  const queryResult = await apolloClient.query<
                    Record<string, { edges: { node: ObjectRecord }[] }>
                  >({
                    query: generateFindManyRecordsQuery({
                      objectMetadataItem: relationObjectMetadataItem,
                      objectMetadataItems,
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
                  definition: filterDefinition,
                  persistAction: 'NONE',
                };
              },
            ),
          )
        ).filter(isDefined);
      },
    [
      apolloClient,
      filterQueryParams,
      hasFiltersQueryParams,
      objectMetadataItem.fields,
      objectMetadataItems,
    ],
  );

  return {
    viewIdQueryParam,
    hasFiltersQueryParams,
    getFiltersFromQueryParams,
  };
};
