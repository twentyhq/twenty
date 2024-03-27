import { createComponentState } from 'twenty-ui';

export const isRecordBoardFetchingRecordsComponentState =
  createComponentState<boolean>({
    key: 'isRecordBoardFetchingRecordsComponentState',
    defaultValue: false,
  });
