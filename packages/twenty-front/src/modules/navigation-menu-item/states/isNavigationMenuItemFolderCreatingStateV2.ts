import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNavigationMenuItemFolderCreatingStateV2 =
  createAtomState<boolean>({
    key: 'isNavigationMenuItemFolderCreatingStateV2',
    defaultValue: false,
  });
