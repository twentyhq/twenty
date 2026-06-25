import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });
};
