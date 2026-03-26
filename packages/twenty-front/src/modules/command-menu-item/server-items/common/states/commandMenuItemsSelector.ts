import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// The metadata store holds items as object[]; this selector
// narrows the type for consumers that need command menu items.
export const commandMenuItemsSelector = createAtomSelector<
  CommandMenuItemFieldsFragment[]
>({
  key: 'commandMenuItemsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'commandMenuItems');

    return storeItem.current as CommandMenuItemFieldsFragment[];
  },
});
