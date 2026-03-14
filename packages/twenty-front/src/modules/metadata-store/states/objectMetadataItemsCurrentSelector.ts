import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsCurrentSelector =
  createAtomSelector<FlatObjectMetadataItem[]>({
    key: 'objectMetadataItemsCurrentSelector',
    get: ({ get }) => {
      const storeItem = get(metadataStoreState, 'objectMetadataItems');

      return storeItem.current as FlatObjectMetadataItem[];
    },
  });
