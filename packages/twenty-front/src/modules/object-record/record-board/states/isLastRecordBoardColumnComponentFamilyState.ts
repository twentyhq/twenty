import { createComponentFamilyState } from 'twenty-ui';

export const isLastRecordBoardColumnComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isLastRecordBoardColumnComponentFamilyState',
    defaultValue: false,
  });
