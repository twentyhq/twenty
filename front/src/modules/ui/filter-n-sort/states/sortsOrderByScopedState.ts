import { selectorFamily } from 'recoil';

import { reduceSortsToOrderBy } from '../helpers';

import { sortsScopedState } from './sortsScopedState';

export const sortsOrderByScopedState = selectorFamily({
  key: 'sortsOrderByScopedState',
  get:
    (param: string) =>
    ({ get }) =>
      reduceSortsToOrderBy(get(sortsScopedState(param))),
});
