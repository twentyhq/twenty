import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const activeRecordBoardCardIdsScopedState = createScopedState<string[]>({
  key: 'activeRecordBoardCardIdsScopedState',
  defaultValue: [],
});
