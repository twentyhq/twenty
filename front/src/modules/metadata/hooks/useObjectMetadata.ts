import { MetadataObject } from '../types/MetadataObject';
import { formatMetadataObjectInput } from '../utils/formatMetadataObjectInput';
import { getObjectSlug } from '../utils/getObjectSlug';

import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';
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

  const findActiveObjectBySlug = (slug: string) =>
    activeMetadataObjects.find(
      (activeObject) => getObjectSlug(activeObject) === slug,
    );

  const { createOneMetadataObject } = useCreateOneMetadataObject();
  const { updateOneMetadataObject } = useUpdateOneMetadataObject();

  const createObject = (
    input: Pick<
      MetadataObject,
      'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) => createOneMetadataObject(formatMetadataObjectInput(input));

  const editObject = (
    input: Pick<
      MetadataObject,
      'id' | 'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) =>
    updateOneMetadataObject({
      idToUpdate: input.id,
      updatePayload: formatMetadataObjectInput(input),
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
    activeObjects: activeMetadataObjects,
    createObject,
    disabledObjects: disabledMetadataObjects,
    disableObject,
    editObject,
    findActiveObjectBySlug,
  };
};
