import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

// Resolved by field id rather than through the route's object, so the input also works where the route has no
// :objectNamePlural, such as a dashboard's filter chips.
export const useOptionsForSelect = (fieldMetadataId: string) => {
  const { foundFieldMetadataItem } = useAtomFamilySelectorValue(
    fieldMetadataItemByIdSelector,
    { fieldMetadataItemId: fieldMetadataId },
  );

  return {
    selectOptions: foundFieldMetadataItem?.options,
  };
};
