import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useObjectMetadataItems = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  return {
    objectMetadataItems,
  };
};
