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
    input,
  }: {
    idToUpdate: string;
    input: Record<string, any>;
    forceRefetch?: boolean;
  }) => {
    const cachedRecord = getRecordFromCache(idToUpdate);

    triggerOptimisticEffects({
      typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      updatedRecords: [
        {
          ...(cachedRecord ?? {}),
          ...input,
        },
      ],
    });

    const updatedRecord = await apolloClient.mutate({
      mutation: updateOneRecordMutation,
      variables: {
        idToUpdate: idToUpdate,
        input: {
          ...input,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectMetadataItem.nameSingular)}`]: {
          ...(cachedRecord ?? {}),
          ...input,
        },
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
