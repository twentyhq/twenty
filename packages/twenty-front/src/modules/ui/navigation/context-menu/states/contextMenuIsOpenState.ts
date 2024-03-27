import { createState } from 'twenty-ui';

export const contextMenuIsOpenState = createState<boolean>({
  key: 'contextMenuIsOpenState',
  defaultValue: false,
});
