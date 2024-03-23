import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordBoardFetchingRecordsComponentState =
  createComponentState<boolean>({
    key: 'isRecordBoardFetchingRecordsComponentState',
    defaultValue: false,
  });
