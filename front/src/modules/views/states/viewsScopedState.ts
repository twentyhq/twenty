import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { View } from '../components/view-bar/types/View';

export const viewsScopedState = createScopedState<View[]>({
  key: 'viewsScopedState',
  defaultValue: [],
});
