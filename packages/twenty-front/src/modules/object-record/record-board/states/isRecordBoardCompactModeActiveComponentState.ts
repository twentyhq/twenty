import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordBoardCompactModeActiveComponentState =
  createComponentState<boolean>({
    key: 'isRecordBoardCompactModeActiveComponentState',
    defaultValue: false,
  });
