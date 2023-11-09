import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { View } from '../types/View';

export const viewsScopedState = createScopedState<View[]>({
  key: 'viewsScopedState',
  defaultValue: [],
});
