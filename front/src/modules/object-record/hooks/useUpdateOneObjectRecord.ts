import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useUpdateOneObjectRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const {
    objectMetadataItem: foundObjectMetadataItem,
    objectNotFoundInMetadata,
    updateOneMutation,
    getRecordFromCache,
    findManyQuery,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation);

  const updateOneObject = async ({
    idToUpdate,
    input,
    forceRefetch,
  }: {
    idToUpdate: string;
    input: Record<string, any>;
    forceRefetch?: boolean;
  }) => {
    if (!foundObjectMetadataItem || !objectNameSingular) {
      return null;
    }

    const cachedRecord = getRecordFromCache(idToUpdate);

    const updatedObject = await mutate({
      variables: {
        idToUpdate: idToUpdate,
        input: {
          ...input,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectNameSingular)}`]: {
          ...(cachedRecord ?? {}),
          ...input,
        },
      },
      refetchQueries: forceRefetch
        ? [getOperationName(findManyQuery) ?? '']
        : undefined,
      awaitRefetchQueries: forceRefetch,
    });

    return updatedObject.data[`update${capitalize(objectNameSingular)}`] as T;
  };

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
