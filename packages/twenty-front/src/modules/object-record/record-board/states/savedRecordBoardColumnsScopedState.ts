import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const savedRecordBoardColumnsScopedState = createStateScopeMap<
  BoardColumnDefinition[]
>({
  key: 'savedRecordBoardColumnsScopedState',
  defaultValue: [],
});
