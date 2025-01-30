import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const correspondingObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.fields.some((field) => field.id === fieldMetadataId),
  );

  const fieldMetadataItem = correspondingObjectMetadataItem?.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(`Field metadata item not found for id ${fieldMetadataId}`);
  }

  return { fieldMetadataItem };
};
