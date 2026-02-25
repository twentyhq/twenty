import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const openNavigationMenuItemFolderIdsStateV2 = createAtomState<string[]>(
  {
    key: 'openNavigationMenuItemFolderIdsStateV2',
    defaultValue: [],
  },
);
