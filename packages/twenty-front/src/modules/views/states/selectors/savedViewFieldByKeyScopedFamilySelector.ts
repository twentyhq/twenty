import { selectorFamily } from 'recoil';

import { ViewField } from '@/views/types/ViewField';

import { savedViewFieldsScopedFamilyState } from '../savedViewFieldsScopedFamilyState';

export const savedViewFieldByKeyScopedFamilySelector = selectorFamily({
  key: 'savedViewFieldByKeyScopedFamilySelector',
  get:
    ({
      viewScopeId,
      viewId,
    }: {
      viewScopeId: string;
      viewId: string | undefined;
    }) =>
    ({ get }) => {
      if (viewId === undefined) {
        return undefined;
      }

      return get(
        savedViewFieldsScopedFamilyState({
          scopeId: viewScopeId,
          familyKey: viewId,
        }),
      ).reduce<Record<string, ViewField>>(
        (result, column) => ({ ...result, [column.fieldMetadataId]: column }),
        {},
      );
    },
});
