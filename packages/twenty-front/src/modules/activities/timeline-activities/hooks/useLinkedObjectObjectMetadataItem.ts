import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useLinkedObjectObjectMetadataItem = (id: string | null) => {
  if (id === null) {
    return null;
  }

  const objectMetadataItems: ObjectMetadataItem[] = useRecoilValue(
    objectMetadataItemsState,
  );

  return (
    objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === id,
    ) ?? null
  );
};
