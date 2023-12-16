import { produce } from 'immer';

import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  DateFilter,
  ObjectRecordFilter,
} from '@/object-record/types/ObjectRecordFilter';
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
      console.log('inside resolver', {
        currentData,
        updatedData,
        newData,
        deletedRecordIds,
        variables,
      });
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
          if (isDefined(variables.filter)) {
            // TODO: the function should be isRecordMatchingFilter
            console.log('variables.filter', variables.filter);

            const isRecordMatchingFilter = (
              record: any,
              filter: ObjectRecordFilter,
            ) => {
              if (filter['completedAt']) {
                if ((filter['completedAt'] as DateFilter).is === 'NULL') {
                  return record.completedAt === null;
                }
                if ((filter['completedAt'] as DateFilter).is === 'NOT_NULL') {
                  return record.completedAt !== null;
                }
              }

              return false;
            };

            console.log('isRecordMatchingFilter', {
              updatedData,
              variables,
              isRecordMatchingFilter: isRecordMatchingFilter(
                updatedData,
                variables.filter,
              ),
            });

            if (!isRecordMatchingFilter(updatedData, variables.filter)) {
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
                // TODO: add ordering logic
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
        }
      });

      return newRecordPaginatedCacheField;
    },
    objectMetadataItem,
  }) satisfies OptimisticEffectDefinition;
