import { atom } from 'recoil';

export const currentNavigationMenuItemFolderIdState = atom<string | null>({
  key: 'currentNavigationMenuItemFolderIdState',
  default: null,
});
