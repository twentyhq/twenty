import { atom } from 'recoil';

export const adminPanelErrorState = atom<string | null>({
  key: 'adminPanelErrorState',
  default: null,
});
