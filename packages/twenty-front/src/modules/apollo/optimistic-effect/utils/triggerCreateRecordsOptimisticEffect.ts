import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectConnection';
import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';
import { capitalize } from '~/utils/string/capitalize';

export const triggerCreateRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  records,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  records: CachedObjectRecord[];
}) => {
  const objectEdgeTypeName = `${capitalize(
    objectMetadataItem.nameSingular,
  )}Edge`;

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        { INVALIDATE, readField, storeFieldName, toReference },
      ) => {
        if (
          !isCachedObjectConnection(
            objectMetadataItem.nameSingular,
            cachedConnection,
          )
        )
          return cachedConnection;

        const { variables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedConnection,
        );
        let nextCachedEdges = cachedEdges ? [...cachedEdges] : [];

        const hasAddedRecords = records
          .map((record) => {
            const matchesFilter =
              !variables?.filter ||
              isRecordMatchingFilter({
                record,
                filter: variables.filter,
                objectMetadataItem,
              });

            if (matchesFilter && record.id) {
              const nodeReference = toReference(record);

              if (nodeReference) {
                nextCachedEdges.push({
                  __typename: objectEdgeTypeName,
                  node: nodeReference,
                  cursor: '',
                });

                return true;
              }
            }

            return false;
          })
          .some((hasAddedRecord) => hasAddedRecord);

        if (!hasAddedRecords) return cachedConnection;

        if (variables?.orderBy) {
          nextCachedEdges = sortCachedObjectEdges({
            edges: nextCachedEdges,
            orderBy: variables.orderBy,
            readCacheField: readField,
          });
        }

        if (isDefined(variables?.first)) {
          if (
            cachedEdges?.length === variables.first &&
            nextCachedEdges.length < variables.first
          ) {
            return INVALIDATE;
          }

          if (nextCachedEdges.length > variables.first) {
            nextCachedEdges.splice(variables.first);
          }
        }

        return { ...cachedConnection, edges: nextCachedEdges };
      },
    },
  });
};
