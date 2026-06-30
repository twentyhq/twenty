import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const frontComponentsSelector = createAtomSelector<FlatFrontComponent[]>(
  {
    key: 'frontComponentsSelector',
    get: ({ get }) => {
      const storeItem = get(metadataStoreState, 'frontComponents');

      return storeItem.current as FlatFrontComponent[];
    },
  },
);
