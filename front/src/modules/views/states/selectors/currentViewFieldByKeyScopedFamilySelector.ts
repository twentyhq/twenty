import { selectorFamily } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { currentViewFieldsScopedFamilyState } from '../currentViewFieldsScopedFamilyState';

export const currentViewFieldByKeyScopedFamilySelector = selectorFamily({
  key: 'currentViewFieldByKeyScopedFamilySelector',
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
        currentViewFieldsScopedFamilyState({
          scopeId: viewScopeId,
          familyKey: viewId,
        }),
      ).reduce<Record<string, ColumnDefinition<FieldMetadata>>>(
        (result, column) => ({ ...result, [column.key]: column }),
        {},
      );
    },
});
