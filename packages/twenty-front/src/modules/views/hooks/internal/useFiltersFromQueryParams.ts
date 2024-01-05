import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import qs from 'qs';
import { useRecoilCallback } from 'recoil';
import z from 'zod';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { assertNotNull } from '~/utils/assert';

const filterQueryParamsSchema = z.object({
  filter: z.record(
    z.record(
      z.nativeEnum(ViewFilterOperand),
      z.string().or(z.array(z.string())),
    ),
  ),
});

export type FilterQueryParams = z.infer<typeof filterQueryParamsSchema>;

export const useFiltersFromQueryParams = () => {
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const generateFindOneRecordQuery = useGenerateFindOneRecordQuery();

  const filterParamsValidation = filterQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );
  const filterQueryParams = useMemo(
    () =>
      filterParamsValidation.success ? filterParamsValidation.data.filter : {},
    [filterParamsValidation],
  );
  const hasFiltersQueryParams = filterParamsValidation.success;

  const getFiltersFromQueryParams = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!hasFiltersQueryParams) return [];

        return (
          await Promise.all(
            Object.entries(filterQueryParams).map<Promise<ViewFilter | null>>(
              async ([fieldName, paramValue]) => {
                const [operand, value] = Object.entries(paramValue)[0];
                const fieldMetadataItem = objectMetadataItem.fields.find(
                  (field) => field.name === fieldName,
                );

                if (!fieldMetadataItem) return null;

                const filterDefinition =
                  formatFieldMetadataItemAsFilterDefinition({
                    field: fieldMetadataItem,
                  });

                if (!filterDefinition) return null;

                const relationObjectMetadataNameSingular =
                  fieldMetadataItem.toRelationMetadata?.fromObjectMetadata
                    .nameSingular;
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
                const relationRecordNames =
                  relationObjectMetadataNameSingular &&
                  relationObjectMetadataItem &&
                  Array.isArray(value)
                    ? await Promise.all(
                        value.map(async (relationRecordId) => {
                          const { data } = await apolloClient.query({
                            query: generateFindOneRecordQuery({
                              objectMetadataItem: relationObjectMetadataItem,
                            }),
                            variables: { objectRecordId: relationRecordId },
                          });

                          return getObjectRecordIdentifier({
                            objectMetadataItem: relationObjectMetadataItem,
                            record: data[relationObjectMetadataNameSingular],
                          }).name;
                        }),
                      )
                    : undefined;

                const filterValue = Array.isArray(value)
                  ? JSON.stringify(value)
                  : value;

                return {
                  id: `tmp-${[fieldName, operand, value].join('-')}`,
                  fieldMetadataId: fieldMetadataItem.id,
                  operand: operand as ViewFilterOperand,
                  value: filterValue,
                  displayValue: relationRecordNames?.join(', ') ?? filterValue,
                  definition: filterDefinition,
                };
              },
            ),
          )
        ).filter(assertNotNull);
      },
    [
      apolloClient,
      filterQueryParams,
      generateFindOneRecordQuery,
      hasFiltersQueryParams,
      objectMetadataItem.fields,
    ],
  );

  return {
    hasFiltersQueryParams,
    getFiltersFromQueryParams,
  };
};
