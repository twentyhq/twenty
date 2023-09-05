import { selectorFamily } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { savedTableColumnsScopedState } from '../savedTableColumnsScopedState';

export const savedTableColumnsByKeyScopedSelector = selectorFamily({
  key: 'savedTableColumnsByKeyScopedSelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedTableColumnsScopedState(viewId)).reduce<
        Record<string, ColumnDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.key]: column }), {}),
});
