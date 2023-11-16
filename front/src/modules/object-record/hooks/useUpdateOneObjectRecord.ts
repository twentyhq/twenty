import { useMutation } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useUpdateOneObjectRecord = ({
  objectNamePlural,
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    updateOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation);

  const updateOneObject = foundObjectMetadataItem
    ? ({
        idToUpdate,
        input,
      }: {
        idToUpdate: string;
        input: Record<string, any>;
      }) => {
        return mutate({
          variables: {
            idToUpdate: idToUpdate,
            input: {
              ...input,
            },
          },
        });
      }
    : undefined;

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
