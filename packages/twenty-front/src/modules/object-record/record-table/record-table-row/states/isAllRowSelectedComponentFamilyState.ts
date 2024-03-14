import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isAllRowSelectedComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isAllRowSelectedComponentFamilyState',
  defaultValue: false,
});
