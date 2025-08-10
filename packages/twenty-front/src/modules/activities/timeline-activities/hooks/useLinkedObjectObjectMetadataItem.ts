import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useLinkedObjectObjectMetadataItem = (id: string | null) => {
  const objectMetadataItems: ObjectMetadataItem[] = useRecoilValue(
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
