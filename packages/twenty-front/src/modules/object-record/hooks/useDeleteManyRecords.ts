import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteManyRecords = <T>({
  objectNameSingular,
  refetchFindManyQuery = false,
}: useDeleteOneRecordProps) => {
  const { performOptimisticEvict } = useOptimisticEvict();
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const {
    objectMetadataItem,
    deleteManyRecordsMutation,
    findManyRecordsQuery,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const apolloClient = useApolloClient();

  const deleteManyRecords = async (idsToDelete: string[]) => {
    triggerOptimisticEffects({
      typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      deletedRecordIds: idsToDelete,
    });

    idsToDelete.forEach((idToDelete) => {
      performOptimisticEvict(
        capitalize(objectMetadataItem.nameSingular),
        'id',
        idToDelete,
      );
    });

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
      refetchQueries: refetchFindManyQuery
        ? [getOperationName(findManyRecordsQuery) ?? '']
        : [],
    });

    return deletedRecords.data[
      `delete${capitalize(objectMetadataItem.namePlural)}`
    ] as T;
  };

  return { deleteManyRecords };
};
