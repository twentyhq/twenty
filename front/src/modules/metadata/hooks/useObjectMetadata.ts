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

  return {
    activeObjects: activeMetadataObjects,
    disabledObjects: disabledMetadataObjects,
    editObject,
  };
};
