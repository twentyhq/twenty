import { BoardColumnDefinition } from '@/object-record/record-board/types/BoardColumnDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordBoardColumnsScopedState = createStateScopeMap<
  BoardColumnDefinition[]
>({
  key: 'recordBoardColumnsScopedState',
  defaultValue: [],
});
