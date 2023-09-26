import { selectorFamily } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import { ColumnDefinition } from '../../types/ColumnDefinition';
import { savedTableColumnsFamilyState } from '../savedTableColumnsFamilyState';

export const savedTableColumnsByKeyFamilySelector = selectorFamily({
  key: 'savedTableColumnsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsFamilyState(viewId)).reduce<
        Record<string, ColumnDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.key]: column }), {}),
});
