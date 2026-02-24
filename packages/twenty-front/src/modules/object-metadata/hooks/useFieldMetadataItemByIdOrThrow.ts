import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useFieldMetadataItemByIdOrThrow = (fieldMetadataId: string) => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  return getFieldMetadataItemByIdOrThrow({
    fieldMetadataId,
    objectMetadataItems,
  });
};
