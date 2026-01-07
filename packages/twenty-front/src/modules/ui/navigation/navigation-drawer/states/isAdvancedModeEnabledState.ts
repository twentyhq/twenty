import { atom } from 'recoil';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const isAdvancedModeEnabledState = atom<boolean>({
  key: 'isAdvancedModeEnabledAtom',
  default: false,
  effects: [localStorageEffect()],
});
