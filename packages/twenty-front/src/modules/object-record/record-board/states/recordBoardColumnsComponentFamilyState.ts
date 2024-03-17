import { createComponentFamilyState } from 'twenty-ui';

import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';

export const recordBoardColumnsComponentFamilyState =
  createComponentFamilyState<RecordBoardColumnDefinition | undefined, string>({
    key: 'recordBoardColumnsComponentFamilyState',
    defaultValue: undefined,
  });
