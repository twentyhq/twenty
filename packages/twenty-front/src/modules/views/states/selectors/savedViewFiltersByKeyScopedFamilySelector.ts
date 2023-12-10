import { selectorFamily } from 'recoil';

import { ViewFilter } from '@/views/types/ViewFilter';

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
      ).reduce<Record<string, ViewFilter>>(
        (result, filter) => ({ ...result, [filter.fieldMetadataId]: filter }),
        {},
      );
    },
});
