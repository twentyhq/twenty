import { createState } from 'twenty-ui';

export const isPersistingViewFieldsState = createState<boolean>({
  key: 'isPersistingViewFieldsState',
  defaultValue: false,
});
