import { MetadataObject } from '../types/MetadataObject';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';
import { useUpdateOneMetadataObject } from './useUpdateOneMetadataObject';

export const useObjectMetadata = () => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const activeMetadataObjects = metadataObjects.filter(
    ({ isActive }) => isActive,
  );
  const disabledMetadataObjects = metadataObjects.filter(
    ({ isActive }) => !isActive,
  );

  const { updateOneMetadataObject } = useUpdateOneMetadataObject();

  const editObject = (metadataObject: MetadataObject) =>
    updateOneMetadataObject({
      idToUpdate: metadataObject.id,
      updatePayload: {
        description: metadataObject.description ?? null,
        icon: metadataObject.icon,
        labelPlural: metadataObject.labelPlural,
        labelSingular: metadataObject.labelSingular,
      },
    });

  const activateObject = (metadataObject: MetadataObject) =>
    updateOneMetadataObject({
      idToUpdate: metadataObject.id,
      updatePayload: { isActive: true },
    });

  const disableObject = (metadataObject: MetadataObject) =>
    updateOneMetadataObject({
      idToUpdate: metadataObject.id,
      updatePayload: { isActive: false },
    });

  return {
    activateObject,
    disableObject,
    activeObjects: activeMetadataObjects,
    disabledObjects: disabledMetadataObjects,
    editObject,
  };
};
