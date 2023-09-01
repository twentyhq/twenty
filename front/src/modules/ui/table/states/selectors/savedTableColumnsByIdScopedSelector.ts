import { selectorFamily } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { savedTableColumnsScopedState } from '../savedTableColumnsScopedState';

export const savedTableColumnsByIdScopedSelector = selectorFamily({
  key: 'savedTableColumnsByIdScopedSelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsScopedState(viewId)).reduce<
        Record<string, ColumnDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.id]: column }), {}),
});
