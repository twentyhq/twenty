import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';

export const useFilterableFieldMetadataItems = (
  objectMetadataItemId: string,
) => {
  const filterableFieldMetadataItems = useFamilySelectorValueV2(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId,
    },
  );

  return { filterableFieldMetadataItems };
};
