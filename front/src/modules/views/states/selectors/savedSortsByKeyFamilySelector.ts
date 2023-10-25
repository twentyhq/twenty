import { selectorFamily } from 'recoil';

import { Sort } from '../../../ui/data/view-bar/types/Sort';
import { savedSortsScopedFamilyState } from '../savedSortsScopedFamilyState';

export const savedSortsByKeyFamilySelector = selectorFamily({
  key: 'savedSortsByKeyFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string }) =>
    ({ get }) =>
      get(
        savedSortsScopedFamilyState({ scopeId: scopeId, familyKey: viewId }),
      ).reduce<Record<string, Sort>>(
        (result, sort) => ({ ...result, [sort.key]: sort }),
        {},
      ),
});
