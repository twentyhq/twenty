import { atom } from 'recoil';

export const internalHotkeysEnabledScopesState = atom<string[]>({
  key: 'internalHotkeysEnabledScopesState',
  default: [],
});
