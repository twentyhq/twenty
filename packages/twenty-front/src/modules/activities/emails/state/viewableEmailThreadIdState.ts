import { atom } from 'recoil';

export const viewableEmailThreadIdState = atom<string | null>({
  key: 'viewableEmailThreadIdState',
  default: null,
});
