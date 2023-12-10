import { produce } from 'immer';

import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { capitalize } from '~/utils/string/capitalize';

export const getRecordOptimisticEffectDefinition = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) =>
  ({
    key: `record-create-optimistic-effect-definition-${objectMetadataItem.nameSingular}`,
    typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
    resolver: ({
      currentData,
      newData,
      deletedRecordIds,
    }: {
      currentData: unknown;
      newData: { id: string } & Record<string, any>;
      deletedRecordIds?: string[];
    }) => {
      const newRecordPaginatedCacheField = produce<
        PaginatedRecordTypeResults<any>
      >(currentData as PaginatedRecordTypeResults<any>, (draft) => {
        if (newData) {
          if (!draft) {
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
      });

      return newRecordPaginatedCacheField;
    },
    isUsingFlexibleBackend: true,
    objectMetadataItem,
  }) satisfies OptimisticEffectDefinition;
