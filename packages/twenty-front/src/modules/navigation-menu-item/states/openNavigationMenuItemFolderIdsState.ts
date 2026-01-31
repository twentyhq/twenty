import { atom } from 'recoil';

export const openNavigationMenuItemFolderIdsState = atom<string[]>({
  key: 'openNavigationMenuItemFolderIdsState',
  default: [],
});
