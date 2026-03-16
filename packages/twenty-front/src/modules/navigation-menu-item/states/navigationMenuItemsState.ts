import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsState = createAtomSelector<
  NavigationMenuItem[]
>({
  key: 'navigationMenuItemsState',
  get: ({ get }) => {
    const entry = get(metadataStoreState, 'navigationMenuItems');

    return entry.current as unknown as NavigationMenuItem[];
  },
});
