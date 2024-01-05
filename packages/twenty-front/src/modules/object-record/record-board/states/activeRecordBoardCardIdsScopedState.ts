import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const activeRecordBoardCardIdsScopedState = createStateScopeMap<
  string[]
>({
  key: 'activeRecordBoardCardIdsScopedState',
  defaultValue: [],
});
