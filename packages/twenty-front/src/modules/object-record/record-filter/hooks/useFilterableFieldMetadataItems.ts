import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';

export const useFilterableFieldMetadataItems = (
  objectMetadataItemId: string,
) => {
  const filterableFieldMetadataItems = useFamilySelectorValue(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId,
    },
  );

  return { filterableFieldMetadataItems };
};
