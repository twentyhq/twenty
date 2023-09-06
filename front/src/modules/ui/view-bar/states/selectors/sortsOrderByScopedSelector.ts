import { selectorFamily } from 'recoil';

import { reduceSortsToOrderBy } from '../../helpers';
import { sortsScopedState } from '../sortsScopedState';

export const sortsOrderByScopedSelector = selectorFamily({
  key: 'sortsOrderByScopedSelector',
  get:
    (param: string) =>
    ({ get }) =>
      reduceSortsToOrderBy(get(sortsScopedState(param))),
});
