import { atom } from 'recoil';

import { localStorageEffect } from '~/utils/recoil-effects';

export enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export const colorSchemeState = atom<ColorScheme>({
  key: 'colorSchemeState',
  default: ColorScheme.System,
  effects: [localStorageEffect('colorScheme')],
});
