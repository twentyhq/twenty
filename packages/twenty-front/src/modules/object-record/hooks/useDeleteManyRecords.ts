import { useApolloClient } from '@apollo/client';

import { isObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isObjectRecordConnection';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerDetachRelationOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDetachRelationOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteManyRecords = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const { objectMetadataItem, deleteManyRecordsMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const getRelationMetadata = useGetRelationMetadata();

  const apolloClient = useApolloClient();

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecords = async (idsToDelete: string[]) => {
    const deletedRecords = await apolloClient.mutate({
      mutation: deleteManyRecordsMutation,
      variables: {
        filter: { id: { in: idsToDelete } },
      },
      optimisticResponse: {
        [mutationResponseField]: idsToDelete.map((idToDelete) => ({
          __typename: capitalize(objectNameSingular),
          id: idToDelete,
        })),
      },
      update: (cache, { data }) => {
        const records = data?.[mutationResponseField];

        if (!records?.length) return;

        objectMetadataItem.fields.forEach((fieldMetadataItem) => {
          const relationMetadata = getRelationMetadata({ fieldMetadataItem });

          if (!relationMetadata) return;

          const { relationObjectMetadataItem, relationFieldMetadataItem } =
            relationMetadata;

          records.forEach((record) => {
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
        });

        triggerDeleteRecordsOptimisticEffect({
          cache,
          objectMetadataItem,
          records: records,
        });
      },
    });

    return deletedRecords.data?.[mutationResponseField] ?? null;
  };

  return { deleteManyRecords };
};
