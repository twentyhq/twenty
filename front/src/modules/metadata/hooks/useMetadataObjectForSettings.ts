import { MetadataObject } from '../types/MetadataObject';
import { formatMetadataObjectInput } from '../utils/formatMetadataObjectInput';
import { getObjectSlug } from '../utils/getObjectSlug';

import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';
import { useDeleteOneMetadataObject } from './useDeleteOneMetadataObject';
import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';
import { useUpdateOneMetadataObject } from './useUpdateOneMetadataObject';

export const useMetadataObjectForSettings = () => {
  const { metadataObjects, loading } = useFindManyMetadataObjects();

  const activeMetadataObjects = metadataObjects.filter(
    ({ isActive }) => isActive,
  );
  const disabledMetadataObjects = metadataObjects.filter(
    ({ isActive }) => !isActive,
  );

  const findActiveMetadataObjectBySlug = (slug: string) =>
    activeMetadataObjects.find(
      (activeMetadataObject) => getObjectSlug(activeMetadataObject) === slug,
    );

  const { createOneMetadataObject } = useCreateOneMetadataObject();
  const { updateOneMetadataObject } = useUpdateOneMetadataObject();
  const { deleteOneMetadataObject } = useDeleteOneMetadataObject();

  const createMetadataObject = (
    input: Pick<
      MetadataObject,
      'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) => createOneMetadataObject(formatMetadataObjectInput(input));

  const editMetadataObject = (
    input: Pick<
      MetadataObject,
      'id' | 'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) =>
    updateOneMetadataObject({
      idToUpdate: input.id,
      updatePayload: formatMetadataObjectInput(input),
    });

  const activateMetadataObject = (metadataObject: Pick<MetadataObject, 'id'>) =>
    updateOneMetadataObject({
      idToUpdate: metadataObject.id,
      updatePayload: { isActive: true },
    });

  const disableMetadataObject = (metadataObject: Pick<MetadataObject, 'id'>) =>
    updateOneMetadataObject({
      idToUpdate: metadataObject.id,
      updatePayload: { isActive: false },
    });

  const eraseMetadataObject = (metadataObject: Pick<MetadataObject, 'id'>) =>
    deleteOneMetadataObject(metadataObject.id);

  return {
    activateMetadataObject,
    activeMetadataObjects,
    createMetadataObject,
    disabledMetadataObjects,
    disableMetadataObject,
    editMetadataObject,
    eraseMetadataObject,
    findActiveMetadataObjectBySlug,
    loading,
  };
};
