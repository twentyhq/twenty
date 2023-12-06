import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useUpdateOneRecord = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem, updateOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({
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

    return updatedRecord.data[
      `update${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;
  };

  return {
    updateOneRecord,
  };
};
