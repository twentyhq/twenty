import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatPermissionFlag } from '@/metadata-store/types/FlatPermissionFlag';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const permissionFlagsSelector = createAtomSelector<FlatPermissionFlag[]>(
  {
    key: 'permissionFlagsSelector',
    get: ({ get }) => {
      const storeItem = get(metadataStoreState, 'permissionFlags');

      return storeItem.current as FlatPermissionFlag[];
    },
  },
);
