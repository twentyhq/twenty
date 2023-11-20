import { useMutation } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useUpdateOneObjectRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    updateOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation);

  const updateOneObject =
    objectNameSingular && foundObjectMetadataItem
      ? async ({
          idToUpdate,
          input,
        }: {
          idToUpdate: string;
          input: Record<string, any>;
        }) => {
          const updatedObject = await mutate({
            variables: {
              idToUpdate: idToUpdate,
              input: {
                ...input,
              },
            },
          });

          return updatedObject.data[
            `update${capitalize(objectNameSingular)}`
          ] as T;
        }
      : undefined;

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
