import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isLastRecordBoardColumnComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isLastRecordBoardColumnComponentFamilyState',
    defaultValue: false,
  });
