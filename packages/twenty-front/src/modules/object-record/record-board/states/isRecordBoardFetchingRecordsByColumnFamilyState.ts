import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRecordBoardFetchingRecordsByColumnFamilyState =
  createComponentFamilyState<boolean, { columnId: string }>({
    key: 'isRecordBoardFetchingRecordsByColumnFamilyState',
    defaultValue: false,
  });
