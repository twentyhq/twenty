import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCacheOrMinimalRecord } from '@/object-record/cache/hooks/useGetRecordFromCacheOrMinimalRecord';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { getDestroyOneRecordMutationResponseField } from '@/object-record/utils/getDestroyOneRecordMutationResponseField';
import { capitalize, isDefined } from 'twenty-shared';

type useDestroyOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDestroyOneRecord = ({
  objectNameSingular,
}: useDestroyOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getRecordFromCacheOrMinimalRecord =
    useGetRecordFromCacheOrMinimalRecord({ objectNameSingular });

  const { destroyOneRecordMutation } = useDestroyOneRecordMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const mutationResponseField =
    getDestroyOneRecordMutationResponseField(objectNameSingular);

  const destroyOneRecord = useCallback(
    async (idToDestroy: string) => {
      const originalRecord = getRecordFromCacheOrMinimalRecord(
        idToDestroy,
        apolloClient.cache,
      );

      const deletedRecord = await apolloClient
        .mutate({
          mutation: destroyOneRecordMutation,
          variables: { idToDestroy },
          optimisticResponse: {
            [mutationResponseField]: {
              __typename: capitalize(objectNameSingular),
              id: idToDestroy,
            },
          },
          update: (cache, { data }) => {
            const record = data?.[mutationResponseField];
            if (!isDefined(record)) return;

            const cachedRecord = getRecordFromCacheOrMinimalRecord(
              record.id,
              cache,
            );
            triggerDestroyRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToDestroy: [cachedRecord],
              objectMetadataItems,
            });
          },
        })
        .catch((error: Error) => {
          triggerCreateRecordsOptimisticEffect({
            cache: apolloClient.cache,
            objectMetadataItem,
            recordsToCreate: [originalRecord],
            objectMetadataItems,
          });

          throw error;
        });

      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      destroyOneRecordMutation,
      getRecordFromCacheOrMinimalRecord,
      mutationResponseField,
      objectMetadataItem,
      objectNameSingular,
      objectMetadataItems,
    ],
  );

  return {
    destroyOneRecord,
  };
};
