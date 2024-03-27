import { createComponentState } from 'twenty-ui';

export const isRecordBoardCompactModeActiveComponentState =
  createComponentState<boolean>({
    key: 'isRecordBoardCompactModeActiveComponentState',
    defaultValue: false,
  });
