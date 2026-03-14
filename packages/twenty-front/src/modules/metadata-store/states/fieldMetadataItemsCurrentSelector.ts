import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const fieldMetadataItemsCurrentSelector =
  createAtomSelector<FlatFieldMetadataItem[]>({
    key: 'fieldMetadataItemsCurrentSelector',
    get: ({ get }) => {
      const storeItem = get(metadataStoreState, 'fieldMetadataItems');

      return storeItem.current as FlatFieldMetadataItem[];
    },
  });
