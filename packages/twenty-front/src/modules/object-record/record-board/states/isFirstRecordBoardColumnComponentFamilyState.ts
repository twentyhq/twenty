import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isFirstRecordBoardColumnComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isFirstRecordBoardColumnComponentFamilyState',
    defaultValue: false,
  });
