import { atomFamily } from 'recoil';

export const numberOfTableRowsScopedState = atomFamily<string, string>({
  key: 'numberOfTableRowsState',
  default: '0',
});
