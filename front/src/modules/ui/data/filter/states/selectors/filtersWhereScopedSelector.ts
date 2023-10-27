import { selectorFamily } from 'recoil';

import { turnFilterIntoWhereClause } from '../../utils/turnFilterIntoWhereClause';
import { selectedFiltersScopedState } from '../selectedFiltersScopedState';

export const filtersWhereScopedSelector = selectorFamily({
  key: 'filtersWhereScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => ({
      AND: get(selectedFiltersScopedState({ scopeId })).map(
        turnFilterIntoWhereClause,
      ),
    }),
});
