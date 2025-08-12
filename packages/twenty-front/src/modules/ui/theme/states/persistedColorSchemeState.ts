import { atom } from 'recoil';

import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { localStorageEffect } from '~/utils/recoil-effects';

export const persistedColorSchemeState = atom<ColorScheme>({
  key: 'colorSchemeState',
  default: 'System',
  effects: [localStorageEffect()],
});
