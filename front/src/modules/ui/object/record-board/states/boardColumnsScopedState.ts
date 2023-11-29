import { BoardColumnDefinition } from '@/ui/object/record-board/types/BoardColumnDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const boardColumnsScopedState = createScopedState<
  BoardColumnDefinition[]
>({
  key: 'boardColumnsScopedState',
  defaultValue: [],
});
