import { createComponentState } from 'twenty-ui';

export const numberOfTableRowsComponentState = createComponentState<number>({
  key: 'numberOfTableRowsComponentState',
  defaultValue: 0,
});
