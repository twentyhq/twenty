import { selectorFamily } from 'recoil';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { currentViewFieldsScopedFamilyState } from '../currentViewFieldsScopedFamilyState';

export const currentViewFieldByKeyScopedFamilySelector = selectorFamily({
  key: 'currentViewFieldByKeyScopedFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string | undefined }) =>
    ({ get }) => {
      if (viewId === undefined) {
        return undefined;
      }
      return get(
        currentViewFieldsScopedFamilyState({
          scopeId: scopeId,
          familyKey: viewId,
        }),
      ).reduce<Record<string, ColumnDefinition<FieldMetadata>>>(
        (result, column) => ({ ...result, [column.key]: column }),
        {},
      );
    },
});
