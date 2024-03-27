import { createComponentState } from 'twenty-ui';

export const isSortSelectedComponentState = createComponentState<boolean>({
  key: 'isSortSelectedComponentState',
  defaultValue: false,
});
