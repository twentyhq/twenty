import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useLinkedObjectObjectMetadataItem = (id: string | null) => {
  const objectMetadataItems: ObjectMetadataItem[] = useAtomValue(
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
