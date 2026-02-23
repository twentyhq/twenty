import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  return {
    objectMetadataItems,
  };
};
