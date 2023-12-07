import { BoardColumnDefinition } from '@/object-record/record-board/types/BoardColumnDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const recordBoardColumnsScopedState = createScopedState<
  BoardColumnDefinition[]
>({
  key: 'recordBoardColumnsScopedState',
  defaultValue: [],
});
