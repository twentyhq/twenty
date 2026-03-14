import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const indexMetadataItemsSelector = createAtomSelector<
  FlatIndexMetadataItem[]
>({
  key: 'indexMetadataItemsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'indexMetadataItems');

    return storeItem.current as FlatIndexMetadataItem[];
  },
});
