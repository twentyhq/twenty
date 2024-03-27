import { createComponentFamilyState } from 'twenty-ui';

export const isFirstRecordBoardColumnComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isFirstRecordBoardColumnComponentFamilyState',
    defaultValue: false,
  });
