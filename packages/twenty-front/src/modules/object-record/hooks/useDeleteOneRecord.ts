import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteOneRecord = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const { objectMetadataItem, deleteOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const getRelationMetadata = useGetRelationMetadata();

  const apolloClient = useApolloClient();

  const mutationResponseField =
    getDeleteOneRecordMutationResponseField(objectNameSingular);

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      const deletedRecord = await apolloClient.mutate({
        mutation: deleteOneRecordMutation,
        variables: { idToDelete },
        optimisticResponse: {
          [mutationResponseField]: {
            __typename: capitalize(objectNameSingular),
            id: idToDelete,
          },
        },
        update: (cache, { data }) => {
          const record = data?.[mutationResponseField];

          if (!record) return;

          objectMetadataItem.fields.forEach((fieldMetadataItem) => {
            const relationMetadata = getRelationMetadata({ fieldMetadataItem });

            if (!relationMetadata) return;

            const { relationObjectMetadataItem, relationFieldMetadataItem } =
              relationMetadata;

            const cachedRecord = getRecordFromCache(record.id, cache);

            if (!cachedRecord) return;

            const previousFieldValue:
              | ObjectRecordConnection
              | ObjectRecord
              | null = cachedRecord[fieldMetadataItem.name];

            const relationRecordIds = isObjectRecordConnection(
              relationObjectMetadataItem.nameSingular,
              previousFieldValue,
            )
              ? previousFieldValue.edges.map(({ node }) => node.id)
              : [previousFieldValue?.id].filter(isDefined);

            relationRecordIds.forEach((relationRecordId) =>
              triggerDetachRelationOptimisticEffect({
                cache,
                objectNameSingular,
                recordId: record.id,
                relationObjectMetadataNameSingular:
                  relationObjectMetadataItem.nameSingular,
                relationFieldName: relationFieldMetadataItem.name,
                relationRecordId,
              }),
            );
          });

          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            records: [record],
          });
        },
      });

      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      getRecordFromCache,
      getRelationMetadata,
      mutationResponseField,
      objectMetadataItem,
      objectNameSingular,
    ],
  );

  return {
    deleteOneRecord,
  };
};
