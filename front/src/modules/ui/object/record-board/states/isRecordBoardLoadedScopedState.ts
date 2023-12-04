import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const isRecordBoardLoadedScopedState = createScopedState<boolean>({
  key: 'isRecordBoardLoadedScopedState',
  defaultValue: false,
});
