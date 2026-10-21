import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type MinimalRole } from '~/generated-metadata/graphql';

export const rolesSelector = createAtomSelector<MinimalRole[]>({
  key: 'rolesSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'roles');

    return storeItem.current as MinimalRole[];
  },
});
