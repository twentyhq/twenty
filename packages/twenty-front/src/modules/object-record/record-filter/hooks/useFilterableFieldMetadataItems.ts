import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useRecoilValue } from 'recoil';

export const useFilterableFieldMetadataItems = (
  objectMetadataItemId: string,
) => {
  const filterableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId,
    }),
  );

  return { filterableFieldMetadataItems };
};
