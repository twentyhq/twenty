import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useLinkedObject = (id: string) => {
  const objectMetadataItems: ObjectMetadataItem[] = useRecoilValue(
    objectMetadataItemsState,
  );

  return (
    objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === id,
    ) ?? null
  );
};
