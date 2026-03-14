import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useObjectMetadataItems = () => {
  const objectMetadataItems = useAtomStateValue(
    objectMetadataItemsWithFieldsSelector,
  );

  return {
    objectMetadataItems,
  };
};
