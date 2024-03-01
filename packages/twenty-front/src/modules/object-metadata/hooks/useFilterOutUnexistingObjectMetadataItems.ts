import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isNonNullable } from '~/utils/isNonNullable';

export const useFilterOutUnexistingObjectMetadataItems = () => {
  const objectMetadataItemsByNameSingularMap = useRecoilValue(
    objectMetadataItemsByNameSingularMapSelector,
  );

  const filterOutUnexistingObjectMetadataItems = (
    objectMetadatItem: ObjectMetadataItem,
  ) =>
    isNonNullable(
      objectMetadataItemsByNameSingularMap.get(objectMetadatItem.nameSingular),
    );

  return {
    filterOutUnexistingObjectMetadataItems,
  };
};
