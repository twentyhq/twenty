import { selectorFamily } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByIdScopedSelector = selectorFamily({
  key: 'tableColumnsByIdScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).reduce<
        Record<string, ColumnDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.id]: column }), {}),
});
