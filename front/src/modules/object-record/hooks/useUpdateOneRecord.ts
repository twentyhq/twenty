import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useUpdateOneRecord = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const {
    objectMetadataItem,
    updateOneRecordMutation,
    getRecordFromCache,
    findManyRecordsQuery,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  const [mutateUpdateOneRecord] = useMutation(updateOneRecordMutation);

  const updateOneRecord = async ({
    idToUpdate,
    input,
    forceRefetch,
  }: {
    idToUpdate: string;
    input: Record<string, any>;
    forceRefetch?: boolean;
  }) => {
    const cachedRecord = getRecordFromCache(idToUpdate);

    const updatedRecord = await mutateUpdateOneRecord({
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
      refetchQueries: forceRefetch
        ? [getOperationName(findManyRecordsQuery) ?? '']
        : undefined,
      awaitRefetchQueries: forceRefetch,
    });

    return updatedRecord.data[
      `update${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;
  };

  return {
    updateOneRecord,
  };
};
