import { produce } from 'immer';

import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';
import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const getRecordOptimisticEffectDefinition = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) =>
  ({
    typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
    resolver: ({
      currentData,
      newData,
      updatedData,
      deletedRecordIds,
      variables,
    }: {
      currentData: unknown;
      newData?: { id: string } & Record<string, any>;
      updatedData?: { id: string } & Record<string, any>;
      deletedRecordIds?: string[];
      variables: ObjectRecordQueryVariables;
    }) => {
      const newRecordPaginatedCacheField = produce<
        PaginatedRecordTypeResults<any>
      >(currentData as PaginatedRecordTypeResults<any>, (draft) => {
        const existingDataIsEmpty = !draft || !draft.edges || !draft.edges[0];

        if (newData) {
          if (existingDataIsEmpty) {
            return {
              __typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
              edges: [{ node: newData, cursor: '' }],
              pageInfo: {
                endCursor: '',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: '',
              },
            };
          }

          const existingRecord = draft.edges.find(
            (edge) => edge.node.id === newData.id,
          );

          if (existingRecord) {
            existingRecord.node = newData;
            return;
          }

          draft.edges.unshift({
            node: newData,
            cursor: '',
            __typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
          });
        }

        if (deletedRecordIds) {
          draft.edges = draft.edges.filter(
            (edge) => !deletedRecordIds.includes(edge.node.id),
          );
        }

        if (updatedData) {
          const updatedRecordIsOutOfQueryFilter =
            isDefined(variables.filter) &&
            !isRecordMatchingFilter({
              record: updatedData,
              filter: variables.filter,
              objectMetadataItem,
            });

          if (updatedRecordIsOutOfQueryFilter) {
            draft.edges = draft.edges.filter(
              (edge) => edge.node.id !== updatedData.id,
            );
          } else {
            const foundUpdatedRecordInCacheQuery = draft.edges.find(
              (edge) => edge.node.id === updatedData.id,
            );

            if (foundUpdatedRecordInCacheQuery) {
              foundUpdatedRecordInCacheQuery.node = updatedData;
            } else {
              // TODO: add order by
              draft.edges.push({
                node: updatedData,
                cursor: '',
                __typename: `${capitalize(
                  objectMetadataItem.nameSingular,
                )}Edge`,
              });
            }
          }
        }
      });

      return newRecordPaginatedCacheField;
    },
    objectMetadataItem,
  }) satisfies OptimisticEffectDefinition;
