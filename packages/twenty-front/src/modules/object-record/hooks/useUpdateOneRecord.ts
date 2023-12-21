import { useApolloClient } from '@apollo/client';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useUpdateOneRecord = <T>({
  objectNameSingular,
}: useUpdateOneRecordProps) => {
  const { objectMetadataItem, updateOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const apolloClient = useApolloClient();

  const updateOneRecord = async ({
    idToUpdate,
    newRecord,
    optimisticRecord,
  }: {
    idToUpdate: string;
    newRecord: Record<string, unknown>;
    optimisticRecord?: Record<string, unknown>;
  }) => {
    const cachedRecord = getRecordFromCache(idToUpdate);

    const optimisticallyUpdatedRecord = {
      ...(cachedRecord ?? {}),
      ...(optimisticRecord ?? newRecord),
    };

    triggerOptimisticEffects({
      typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      updatedRecords: [optimisticallyUpdatedRecord],
    });

    const updatedRecord = await apolloClient.mutate({
      mutation: updateOneRecordMutation,
      variables: {
        idToUpdate,
        input: {
          ...newRecord,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectMetadataItem.nameSingular)}`]:
          optimisticallyUpdatedRecord,
      },
    });

    if (!updatedRecord?.data) {
      return null;
    }

    const updatedData = updatedRecord.data[
      `update${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;

    return updatedData;
  };

  return {
    updateOneRecord,
  };
};
