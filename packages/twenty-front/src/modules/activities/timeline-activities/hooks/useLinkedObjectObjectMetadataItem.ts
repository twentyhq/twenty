import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useLinkedObjectObjectMetadataItem = (id: string | null) => {
  const objectMetadataItems: ObjectMetadataItem[] = useAtomStateValue(
    objectMetadataItemsSelector,
  );

  if (id === null) {
    return null;
  }
  return (
    objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === id,
    ) ?? null
  );
};
