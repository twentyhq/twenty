import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const savedBoardColumnsScopedState = createScopedState<
  BoardColumnDefinition[]
>({
  key: 'savedBoardColumnsScopedState',
  defaultValue: [],
});
