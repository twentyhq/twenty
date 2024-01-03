import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';

import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const getRecordOptimisticEffectDefinition = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}): OptimisticEffectDefinition => ({
  typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
  resolver: ({
    currentCacheData: currentData,
    createdRecords,
    updatedRecords,
    deletedRecordIds,
    variables,
  }) => {
    const newRecordPaginatedCacheField = produce<
      PaginatedRecordTypeResults<any>
    >(currentData as PaginatedRecordTypeResults<any>, (draft) => {
      const existingDataIsEmpty = !draft || !draft.edges || !draft.edges[0];

      if (isNonEmptyArray(createdRecords)) {
        if (existingDataIsEmpty) {
          return {
            __typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
            edges: createdRecords.map((createdRecord) => ({
              node: createdRecord,
              cursor: '',
            })),
            pageInfo: {
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
          };
        } else {
          for (const createdRecord of createdRecords) {
            const existingRecord = draft.edges.find(
              (edge) => edge.node.id === createdRecord.id,
            );

            if (existingRecord) {
              existingRecord.node = createdRecord;
              continue;
            }

            draft.edges.unshift({
              node: createdRecord,
              cursor: '',
              __typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
            });
          }
        }
      }

      if (isNonEmptyArray(deletedRecordIds)) {
        draft.edges = draft.edges.filter(
          (edge) => !deletedRecordIds.includes(edge.node.id),
        );
      }

      if (isNonEmptyArray(updatedRecords)) {
        for (const updatedRecord of updatedRecords) {
          const updatedRecordIsOutOfQueryFilter =
            isDefined(variables.filter) &&
            !isRecordMatchingFilter({
              record: updatedRecord,
              filter: variables.filter,
              objectMetadataItem,
            });

          if (updatedRecordIsOutOfQueryFilter) {
            draft.edges = draft.edges.filter(
              (edge) => edge.node.id !== updatedRecord.id,
            );
          } else {
            const foundUpdatedRecordInCacheQuery = draft.edges.find(
              (edge) => edge.node.id === updatedRecord.id,
            );

            if (foundUpdatedRecordInCacheQuery) {
              foundUpdatedRecordInCacheQuery.node = updatedRecord;
            } else {
              // TODO: add order by
              draft.edges.push({
                node: updatedRecord,
                cursor: '',
                __typename: `${capitalize(
                  objectMetadataItem.nameSingular,
                )}Edge`,
              });
            }
          }
        }
      }
    });

    return newRecordPaginatedCacheField;
  },
  objectMetadataItem,
});
