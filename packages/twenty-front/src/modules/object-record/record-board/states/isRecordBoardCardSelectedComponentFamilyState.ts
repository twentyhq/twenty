import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRecordBoardCardSelectedComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isRecordBoardCardSelectedComponentFamilyState',
    defaultValue: false,
  });
