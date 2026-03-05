import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useLinkedObjectObjectMetadataItem = (id: string | null) => {
  const objectMetadataItems: ObjectMetadataItem[] = useAtomStateValue(
    objectMetadataItemsState,
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
