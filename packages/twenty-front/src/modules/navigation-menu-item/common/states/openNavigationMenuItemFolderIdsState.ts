import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const openNavigationMenuItemFolderIdsState = createAtomState<string[]>({
  key: 'openNavigationMenuItemFolderIdsState',
  defaultValue: [],
});
