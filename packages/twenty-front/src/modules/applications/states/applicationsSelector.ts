import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const applicationsSelector = createAtomSelector<FlatApplication[]>({
  key: 'applicationsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'applications');

    return storeItem.current as FlatApplication[];
  },
});
