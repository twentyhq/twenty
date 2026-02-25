import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  return getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });
};
