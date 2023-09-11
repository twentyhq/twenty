import { selectorFamily } from 'recoil';

import type { Filter } from '../../types/Filter';
import { savedFiltersFamilyState } from '../savedFiltersFamilyState';

export const savedFiltersByKeyFamilySelector = selectorFamily({
  key: 'savedFiltersByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedFiltersFamilyState(viewId)).reduce<Record<string, Filter>>(
        (result, filter) => ({ ...result, [filter.key]: filter }),
        {},
      ),
});
