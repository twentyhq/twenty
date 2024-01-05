import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';

export const useFilterOutUnexistingObjectMetadataItems = () => {
  const objectMetadataItemsByNameSingularMap = useRecoilValue(
    objectMetadataItemsByNameSingularMapSelector,
  );

  const filterOutUnexistingObjectMetadataItems = (
    objectMetadatItem: ObjectMetadataItem,
  ) =>
    isDefined(
      objectMetadataItemsByNameSingularMap.get(objectMetadatItem.nameSingular),
    );

  return {
    filterOutUnexistingObjectMetadataItems,
  };
};
