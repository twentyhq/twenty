import { atom } from 'recoil';

import { CompanyProgressDict } from '../components/Board';

export const boardItemsState = atom<CompanyProgressDict>({
  key: 'boardItemsState',
  default: {},
});
