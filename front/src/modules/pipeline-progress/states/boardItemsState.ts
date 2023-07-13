import { atom } from 'recoil';

import { EntityProgressDict } from '../components/EntityProgressBoard';

export const boardItemsState = atom<EntityProgressDict>({
  key: 'boardItemsState',
  default: {},
});
