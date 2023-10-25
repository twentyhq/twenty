import { selectorFamily } from 'recoil';

import { Sort } from '@/ui/data/sort/types/Sort';

import { savedViewSortsScopedFamilyState } from '../savedViewSortsScopedFamilyState';

export const savedViewSortsByKeyScopedFamilySelector = selectorFamily({
  key: 'savedViewSortsByKeyScopedFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string | undefined }) =>
    ({ get }) => {
      if (viewId === undefined) {
        return undefined;
      }
      return get(
        savedViewSortsScopedFamilyState({
          scopeId: scopeId,
          familyKey: viewId,
        }),
      ).reduce<Record<string, Sort>>(
        (result, sort) => ({ ...result, [sort.key]: sort }),
        {},
      );
    },
});
