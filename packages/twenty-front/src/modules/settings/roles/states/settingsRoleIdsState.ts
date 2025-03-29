import { atom } from 'recoil';

export const settingsRoleIdsState = atom<string[]>({
  key: 'settingsRoleIdsState',
  default: [],
});
