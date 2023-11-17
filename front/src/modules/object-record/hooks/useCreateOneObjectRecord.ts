import { useMutation } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateOneObjectRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    createOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneMutation);

  const createOneObject =
    objectNameSingular && foundObjectMetadataItem
      ? async (input: Record<string, any>) => {
          const createdObject = await mutate({
            variables: {
              input: { ...input, id: v4() },
            },
          });

          triggerOptimisticEffects(
            `${capitalize(foundObjectMetadataItem.nameSingular)}Edge`,
            createdObject.data[
              `create${capitalize(foundObjectMetadataItem.nameSingular)}`
            ],
          );
          return createdObject.data[
            `create${capitalize(objectNameSingular)}`
          ] as T;
        }
      : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
