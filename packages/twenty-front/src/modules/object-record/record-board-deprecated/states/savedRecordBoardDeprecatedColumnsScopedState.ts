import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

export const savedRecordBoardDeprecatedColumnsScopedState = createStateScopeMap<
  BoardColumnDefinition[]
>({
  key: 'savedRecordBoardDeprecatedColumnsScopedState',
  defaultValue: [],
});
