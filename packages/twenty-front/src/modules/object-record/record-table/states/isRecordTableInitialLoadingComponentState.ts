import { createComponentState } from 'twenty-ui';

export const isRecordTableInitialLoadingComponentState =
  createComponentState<boolean>({
    key: 'isRecordTableInitialLoadingComponentState',
    defaultValue: true,
  });
