import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  console.log(objectMetadataItems);

  return {
    objectMetadataItems,
  };
};
