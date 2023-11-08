import { selectorFamily } from 'recoil';

import { turnFilterIntoWhereClause } from '../../../object-filter-dropdown/utils/turnFilterIntoWhereClause';
import { tableFiltersScopedState } from '../tableFiltersScopedState';

export const tableFiltersWhereScopedSelector = selectorFamily({
  key: 'tablefiltersWhereScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => ({
      AND: get(tableFiltersScopedState({ scopeId })).map(
        turnFilterIntoWhereClause,
      ),
    }),
});
