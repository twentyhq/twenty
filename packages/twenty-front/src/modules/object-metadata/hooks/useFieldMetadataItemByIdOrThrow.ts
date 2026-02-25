import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFieldMetadataItemByIdOrThrow = (fieldMetadataId: string) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  return getFieldMetadataItemByIdOrThrow({
    fieldMetadataId,
    objectMetadataItems,
  });
};
