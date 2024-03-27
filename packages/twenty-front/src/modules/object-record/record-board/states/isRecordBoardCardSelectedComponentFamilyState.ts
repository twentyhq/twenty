import { createComponentFamilyState } from 'twenty-ui';

export const isRecordBoardCardSelectedComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isRecordBoardCardSelectedComponentFamilyState',
    defaultValue: false,
  });
