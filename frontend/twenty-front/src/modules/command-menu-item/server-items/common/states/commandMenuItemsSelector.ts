import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const commandMenuItemsSelector = createAtomSelector<
  CommandMenuItemFieldsFragment[]
>({
  key: 'commandMenuItemsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'commandMenuItems');

    return storeItem.current as CommandMenuItemFieldsFragment[];
  },
});
