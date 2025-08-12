import { atom } from 'recoil';

import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { localStorageEffect } from '~/utils/recoil-effects';

export const persistedColorSchemeState = atom<ColorScheme>({
  key: 'persistedColorSchemeState',
  default: 'System',
  effects: [localStorageEffect()],
});
