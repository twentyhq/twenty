import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';

export const useIsObjectMetadataActive = (objectNameSingular: string) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  
  const objectMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular
  );

  return objectMetadata?.isActive ?? false;
};