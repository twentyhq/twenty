import { atom } from 'recoil';

export const selectedRoleState = atom<string | undefined>({
  key: 'selectedRoleState',
  default: undefined,
});
