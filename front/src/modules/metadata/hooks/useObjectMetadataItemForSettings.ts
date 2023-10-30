import { ObjectMetadataItem } from '../types/ObjectMetadataItem';
import { formatObjectMetadataItemInput } from '../utils/formatObjectMetadataItemInput';
import { getObjectSlug } from '../utils/getObjectSlug';

import { useCreateOneObjectMetadataItem } from './useCreateOneObjectMetadataItem';
import { useDeleteOneObjectMetadataItem } from './useDeleteOneObjectMetadataItem';
import { useFindManyObjectMetadataItems } from './useFindManyObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from './useUpdateOneObjectMetadataItem';

export const useObjectMetadataItemForSettings = () => {
  const { ObjectMetadataItems, loading } = useFindManyObjectMetadataItems();

  const activeObjectMetadataItems = ObjectMetadataItems.filter(
    ({ isActive }) => isActive,
  );
  const disabledObjectMetadataItems = ObjectMetadataItems.filter(
    ({ isActive }) => !isActive,
  );

  const findActiveObjectMetadataItemBySlug = (slug: string) =>
    activeObjectMetadataItems.find(
      (activeObjectMetadataItem) => getObjectSlug(activeObjectMetadataItem) === slug,
    );

  const { createOneObjectMetadataItem } = useCreateOneObjectMetadataItem();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();

  const createObjectMetadataItem = (
    input: Pick<
      ObjectMetadataItem,
      'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) => createOneObjectMetadataItem(formatObjectMetadataItemInput(input));

  const editObjectMetadataItem = (
    input: Pick<
      ObjectMetadataItem,
      'id' | 'labelPlural' | 'labelSingular' | 'icon' | 'description'
    >,
  ) =>
    updateOneObjectMetadataItem({
      idToUpdate: input.id,
      updatePayload: formatObjectMetadataItemInput(input),
    });

  const activateObjectMetadataItem = (ObjectMetadataItem: Pick<ObjectMetadataItem, 'id'>) =>
    updateOneObjectMetadataItem({
      idToUpdate: ObjectMetadataItem.id,
      updatePayload: { isActive: true },
    });

  const disableObjectMetadataItem = (ObjectMetadataItem: Pick<ObjectMetadataItem, 'id'>) =>
    updateOneObjectMetadataItem({
      idToUpdate: ObjectMetadataItem.id,
      updatePayload: { isActive: false },
    });

  const eraseObjectMetadataItem = (ObjectMetadataItem: Pick<ObjectMetadataItem, 'id'>) =>
    deleteOneObjectMetadataItem(ObjectMetadataItem.id);

  return {
    activateObjectMetadataItem,
    activeObjectMetadataItems,
    createObjectMetadataItem,
    disabledObjectMetadataItems,
    disableObjectMetadataItem,
    editObjectMetadataItem,
    eraseObjectMetadataItem,
    findActiveObjectMetadataItemBySlug,
    loading,
  };
};
