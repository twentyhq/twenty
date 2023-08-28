import { selectorFamily } from 'recoil';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const tableColumnsByIdScopedSelector = selectorFamily({
  key: 'tableColumnsByIdScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).reduce<
        Record<string, ViewFieldDefinition<ViewFieldMetadata>>
      >((result, column) => ({ ...result, [column.id]: column }), {}),
});
