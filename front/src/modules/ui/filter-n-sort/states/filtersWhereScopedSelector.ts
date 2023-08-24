import { selectorFamily } from 'recoil';

import { turnFilterIntoWhereClause } from '../utils/turnFilterIntoWhereClause';

import { filtersScopedState } from './filtersScopedState';

export const filtersWhereScopedSelector = selectorFamily({
  key: 'filtersWhereScopedSelector',
  get:
    (param: string) =>
    ({ get }) => ({
      AND: get(filtersScopedState(param)).map(turnFilterIntoWhereClause),
    }),
});
