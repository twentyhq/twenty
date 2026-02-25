import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useFilterableFieldMetadataItems = (
  objectMetadataItemId: string,
) => {
  const filterableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId,
    },
  );

  return { filterableFieldMetadataItems };
};
