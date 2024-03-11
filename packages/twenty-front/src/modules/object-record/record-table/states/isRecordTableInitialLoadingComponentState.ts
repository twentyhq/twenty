import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordTableInitialLoadingComponentState =
  createComponentState<boolean>({
    key: 'isRecordTableInitialLoadingComponentState',
    defaultValue: true,
  });
