import { createComponentFamilyState } from 'twenty-ui';

export const isRowSelectedComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isRowSelectedComponentFamilyState',
  defaultValue: false,
});
