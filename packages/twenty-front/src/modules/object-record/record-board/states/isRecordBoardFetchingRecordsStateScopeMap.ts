import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const isRecordBoardFetchingRecordsStateScopeMap =
  createStateScopeMap<boolean>({
    key: 'isRecordBoardFetchingRecordsStateScopeMap',
    defaultValue: false,
  });
