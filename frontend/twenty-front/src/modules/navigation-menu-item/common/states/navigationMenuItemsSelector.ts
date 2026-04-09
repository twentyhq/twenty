import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsSelector = createAtomSelector<
  NavigationMenuItem[]
>({
  key: 'navigationMenuItemsSelector',
  get: ({ get }) => {
    const entry = get(metadataStoreState, 'navigationMenuItems');
    const items = entry.current as unknown as NavigationMenuItem[];

    return items;
  },
});
