import { createComponentState } from 'twenty-ui';

export const tableRowIdsComponentState = createComponentState<string[]>({
  key: 'tableRowIdsComponentState',
  defaultValue: [],
});
