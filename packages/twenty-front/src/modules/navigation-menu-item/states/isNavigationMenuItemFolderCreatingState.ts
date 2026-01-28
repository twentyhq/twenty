import { atom } from 'recoil';

export const isNavigationMenuItemFolderCreatingState = atom<boolean>({
  key: 'isNavigationMenuItemFolderCreatingState',
  default: false,
});
