import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type DeleteManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
};

export const useDeleteManyRecords = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem, deleteManyRecordsMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecords = async (
    idsToDelete: string[],
    options?: DeleteManyRecordsOptions,
  ) => {
    const deletedRecords = await apolloClient.mutate({
      mutation: deleteManyRecordsMutation,
      variables: {
        filter: { id: { in: idsToDelete } },
      },
      optimisticResponse: options?.skipOptimisticEffect
        ? undefined
        : {
            [mutationResponseField]: idsToDelete.map((idToDelete) => ({
              __typename: capitalize(objectNameSingular),
              id: idToDelete,
            })),
          },
      update: options?.skipOptimisticEffect
        ? undefined
        : (cache, { data }) => {
            const records = data?.[mutationResponseField];

            if (!records?.length) return;

            const cachedRecords = records
              .map((record) => getRecordFromCache(record.id, cache))
              .filter(isDefined);

            triggerDeleteRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToDelete: cachedRecords,
              objectMetadataItems,
            });
          },
    });

    return deletedRecords.data?.[mutationResponseField] ?? null;
  };

  return { deleteManyRecords };
};
