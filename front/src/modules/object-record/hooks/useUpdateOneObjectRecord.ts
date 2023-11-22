import { useMutation } from '@apollo/client';

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
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation);

  const updateOneObject = async ({
    idToUpdate,
    input,
  }: {
    idToUpdate: string;
    input: Record<string, any>;
  }) => {
    if (!foundObjectMetadataItem || !objectNameSingular) {
      return null;
    }

    const updatedObject = await mutate({
      variables: {
        idToUpdate: idToUpdate,
        input: {
          ...input,
        },
      },
      optimisticResponse: {
        [`update${capitalize(objectNameSingular)}`]: {
          id: idToUpdate,
          ...input,
        },
      },
    });

    return updatedObject.data[`update${capitalize(objectNameSingular)}`] as T;
  };

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
