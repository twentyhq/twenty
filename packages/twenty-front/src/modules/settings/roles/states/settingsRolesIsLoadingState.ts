import { atom } from 'recoil';

export const settingsRolesIsLoadingState = atom<boolean>({
  key: 'settingsRolesIsLoadingState',
  default: true,
});
