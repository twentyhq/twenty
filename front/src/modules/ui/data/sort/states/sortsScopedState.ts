import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Sort } from '../../view-bar/types/Sort';

export const sortsScopedState = createScopedState<Sort[]>({
  key: 'sortsScopedState',
  defaultValue: [],
});
