import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordBoardCompactModeActiveStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'isRecordBoardCompactModeActiveStateScopeMap',
    defaultValue: false,
  });
