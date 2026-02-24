import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useObjectMetadataItems = () => {
  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  return {
    objectMetadataItems,
  };
};
