import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteManyRecords = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const { objectMetadataItem, deleteManyRecordsMutation } =
    useObjectMetadataItem({ objectNameSingular });

  const apolloClient = useApolloClient();

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecords = async (idsToDelete: string[]) => {
    const deleteRecordFilter: ObjectRecordQueryFilter = {
      id: {
        in: idsToDelete,
      },
    };
    const deletedRecords = await apolloClient.mutate({
      mutation: deleteManyRecordsMutation,
      variables: {
        filter: deleteRecordFilter,
        // atMost: idsToDelete.length,
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

        triggerDeleteRecordsOptimisticEffect({
          cache,
          objectMetadataItem,
          records,
        });
      },
    });

    return deletedRecords.data?.[mutationResponseField] ?? null;
  };

  return { deleteManyRecords };
};
