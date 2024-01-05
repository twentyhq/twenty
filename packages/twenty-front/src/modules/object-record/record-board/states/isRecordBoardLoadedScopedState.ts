import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordBoardLoadedScopedState = createStateScopeMap<boolean>({
  key: 'isRecordBoardLoadedScopedState',
  defaultValue: false,
});
