import { createComponentState } from 'twenty-ui';

export const isSoftFocusActiveComponentState = createComponentState<boolean>({
  key: 'isSoftFocusActiveComponentState',
  defaultValue: false,
});
