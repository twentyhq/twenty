import { selectorFamily } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';

import type { ColumnDefinition } from '../../types/ColumnDefinition';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByKeyScopedSelector = selectorFamily({
  key: 'tableColumnsByKeyScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).reduce<
        Record<string, ColumnDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.key]: column }), {}),
});
