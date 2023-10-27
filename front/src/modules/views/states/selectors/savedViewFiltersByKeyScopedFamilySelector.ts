import { selectorFamily } from 'recoil';

import { Filter } from '@/ui/data/filter/types/Filter';

import { savedViewFiltersScopedFamilyState } from '../savedViewFiltersScopedFamilyState';

export const savedViewFiltersByKeyScopedFamilySelector = selectorFamily({
  key: 'savedViewFiltersByKeyScopedFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string | undefined }) =>
    ({ get }) => {
      if (viewId === undefined) {
        return undefined;
      }
      return get(
        savedViewFiltersScopedFamilyState({
          scopeId: scopeId,
          familyKey: viewId,
        }),
      ).reduce<Record<string, Filter>>(
        (result, filter) => ({ ...result, [filter.key]: filter }),
        {},
      );
    },
});
