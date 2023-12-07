import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const savedRecordBoardColumnsScopedState = createScopedState<
  BoardColumnDefinition[]
>({
  key: 'savedRecordBoardColumnsScopedState',
  defaultValue: [],
});
