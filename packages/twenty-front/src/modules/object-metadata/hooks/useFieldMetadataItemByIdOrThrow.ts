import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useFieldMetadataItemByIdOrThrow = (fieldMetadataId: string) => {
  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  return getFieldMetadataItemByIdOrThrow({
    fieldMetadataId,
    objectMetadataItems,
  });
};
