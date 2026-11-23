import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const navigationMenuItemsWithHiddenSelector = createAtomSelector<
  NavigationMenuItem[]
>({
  key: 'navigationMenuItemsWithHiddenSelector',
  get: ({ get }) =>
    get(metadataStoreState, 'navigationMenuItems')
      .current as unknown as NavigationMenuItem[],
});
