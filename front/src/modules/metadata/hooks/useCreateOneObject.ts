import { useMutation } from '@apollo/client';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useCreateOneObject = ({
  objectNamePlural,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'>) => {
  const { triggerOptimisticEffects } = useOptimisticEffect();

  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    createOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneMutation);

  const createOneObject = foundObjectMetadataItem
    ? async (input: Record<string, any>) => {
        const createdObject = await mutate({
          variables: {
            input: {
              ...input,
            },
          },
        });

        triggerOptimisticEffects(
          `${capitalize(foundObjectMetadataItem.nameSingular)}Edge`,
          createdObject.data[
            `create${capitalize(foundObjectMetadataItem.nameSingular)}`
          ],
        );
      }
    : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
