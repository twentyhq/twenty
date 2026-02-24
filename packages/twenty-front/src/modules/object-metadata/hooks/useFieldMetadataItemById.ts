import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  return getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });
};
