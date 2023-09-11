import { atomFamily } from 'recoil';

import type { View } from '../types/View';

export const viewsScopedState = atomFamily<View[], string>({
  key: 'viewsScopedState',
  default: [],
});
