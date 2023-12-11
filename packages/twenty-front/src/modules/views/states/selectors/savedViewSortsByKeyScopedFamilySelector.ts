import { selectorFamily } from 'recoil';

import { ViewSort } from '@/views/types/ViewSort';

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
      ).reduce<Record<string, ViewSort>>(
        (result, sort) => ({ ...result, [sort.fieldMetadataId]: sort }),
        {},
      );
    },
});
