import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNavigationMenuItemFolderCreatingState = createAtomState<boolean>(
  {
    key: 'isNavigationMenuItemFolderCreatingState',
    defaultValue: false,
  },
);
