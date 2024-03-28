import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRowSelectedComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isRowSelectedComponentFamilyState',
  defaultValue: false,
});
