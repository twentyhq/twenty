import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

export const useNonSystemActiveObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const nonSystemActiveObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter(
        (objectMetadataItem) =>
          !objectMetadataItem.isSystem && objectMetadataItem.isActive,
      ),
    [objectMetadataItems],
  );

  return {
    nonSystemActiveObjectMetadataItems,
  };
};
